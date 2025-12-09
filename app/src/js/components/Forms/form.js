'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  getForm,
  getRequest,
  copyRequest,
  listRequestReviewers,
  getDetailedUsers,
  deleteStepReviewApproval,
  createStepReviewApproval
} from '../../actions';
import { get } from 'object-path';
import {
  shortDateNoTimeYearFirst
} from '../../utils/format';
import { strings } from '../locale';
import Loading from '../LoadingIndicator/loading-indicator';
import ErrorReport from '../Errors/report';
import Metadata from '../Table/Metadata';
import ReviewStep from '../Review/review';
import _config from '../../config';
import { requestPrivileges } from '../../utils/privileges';
import Comments from '../Comments/comments';
import { listFileUploadsBySubmission, listFileDownloadsByKey } from '../../actions';
import { loadToken } from '../../utils/auth';
import { CueFileUtility, LocalUpload } from '@edpub/upload-utility';
import Select from 'react-select';
import { Modal, Button } from 'react-bootstrap'; 
import CustomOption from '../SelectOptions/SelectOptions'

const { basepath } = _config;

const urlReturn = `${basepath}requests`;

const metaAccessors = [
  {
    label: 'Short Name',
    property: 'short_name'
  },
  {
    label: 'Name',
    property: 'long_name'
  },
  {
    label: 'Description',
    property: 'description'
  },
  {
    label: 'Version',
    property: 'version'
  },
  {
    label: 'Created',
    accessor: d => {
      return (shortDateNoTimeYearFirst(d));
    },
    property: 'created_at'
  }
];

class FormOverview extends React.Component {
  constructor () {
    super();
    this.navigateBack = this.navigateBack.bind(this);
    this.cloneRequest = this.cloneRequest.bind(this);
    this.printForm = this.printForm.bind(this);
    this.displayName = strings.form;
    this.state = {
      clone: false,
      filteredReviewers: [],
      allUsers: [],
      isAddReviewerDisabled: false,
      selectedReviewers: [],
      loading: false,
      showErrorModal: false, 
      errorMessage: '', 
    };
  }
  async componentDidMount () {
    const requestId = this.props.location.search.split('=')[1];
    const { formId } = this.props.match.params;
    const { dispatch } = this.props;
    let isHidden = false;
    if (typeof this.props.requests.detail !== 'undefined' && typeof this.props.requests.data !== 'undefined' && typeof this.props.requests.detail.data.hidden !== 'undefined') {
      isHidden = this.props.requests.detail.data.hidden;
    }
    const { canInitialize } = requestPrivileges(this.props.privileges);
    await dispatch(getRequest(requestId));
    let userReviewList = await dispatch(listRequestReviewers(requestId));
    let allU;
    if(!this.props.requests.detail.data || this.props.requests.detail.data.error){
      this.setState({ showErrorModal: true, errorMessage: 'Error fetching form data, please check on the Form/Request ID.'});
    }else{
      const stepName = this.props.requests?.detail?.data?.step_name;
      if (stepName && stepName.includes('uwg')) {
        allU = await dispatch(getDetailedUsers('19ac227b-e96c-46fa-a378-cf82c461b669'));
      } else {
        allU = await dispatch(getDetailedUsers());
      }
      const dataFilter = this.props.requests.detail.data.step_name;
      const filteredData = userReviewList.data.filter(item => item.step_name === dataFilter);
      this.setState({filteredReviewers: filteredData, allUsers: allU});
      await dispatch(getForm(formId, this.props.requests.detail.data.daac_id));
      await this.getUploadedFiles(requestId);
  
      if (canInitialize && !isHidden) {
        const { history } = this.props;
        if (history.location.state !== undefined && history.location.state.clone) {
          this.setState({ clone: true });
        }
      }
      if (localStorage.getItem('print') !== null) {
        const backHref = localStorage.getItem('print');
        localStorage.removeItem('print');
        await this.printForm();
        window.location.href = `${window.location.origin}/${backHref}`;
      }
    }
  }

  navigateBack () {
    const { history } = this.props;
    history.push('/requests');
  }

  errors () {
    const formId = this.props.match.params.formId;
    return [
      get(this.props.forms.map, [formId, 'error']),
    ].filter(Boolean);
  }

  getRandom () {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  async cloneRequest () {
    const requestId = this.props.location.search.split('=')[1];
    const name = JSON.parse(window.localStorage.getItem('auth-user')).name;
    const id = JSON.parse(window.localStorage.getItem('auth-user')).id;
    const fields = document.querySelectorAll('input[type=checkbox]:checked');
    const fieldArray = [];
    for (const ea in fields) {
      if (fields[ea].id) {
        if (fields[ea].getAttribute('data-type-bbox') === 'true') {
          fieldArray.push(`${fields[ea].id}_north`.replace(/_checkbox/, ''));
          fieldArray.push(`${fields[ea].id}_south`.replace(/_checkbox/, ''));
          fieldArray.push(`${fields[ea].id}_east`.replace(/_checkbox/, ''));
          fieldArray.push(`${fields[ea].id}_west`.replace(/_checkbox/, ''));
        } else {
          fieldArray.push(fields[ea].id.replace(/_checkbox/, ''));
        }
      }
    }
    const payload = {
      id: requestId,
      copy_filter: fieldArray,
      action_copy: true,
      copy_context: `Copied from form fields checked by ${name} (${id})`
    };
    await this.props.dispatch(copyRequest(payload));
    this.navigateBack();
  }

  getAnswer (id) {
    if (this.hasSavedAnswers()) {
      const data = this.props.requests.detail.data.form_data;
      if (typeof data[id] !== 'undefined' && data[id] !== '') {
        return (data[id]);
      } else {
        return 'no answer';
      }
    } else {
      return (
        '__________________________________________'
      );
    }
  }

  hasSavedAnswers () {
    if (typeof this.props.requests !== 'undefined' &&
    typeof this.props.requests.detail.data !== 'undefined' &&
    typeof this.props.requests.detail.data.form_data !== 'undefined') {
      return true;
    } else {
      return false;
    }
  }

  getQuestionEnums (id, keys, enums, data, title) {
    // This is called if a table has data
    const length = parseInt(100 / enums.length);
    return (
      <li key={this.getRandom()} style={{ marginTop: '3px', marginBottom: '3px' }}>
        {
          this.state.clone
            ? this.getCheckbox(id, data, false, true, title)
            : null
        }
        <table style={{ minWidth: '100%' }}>
          <thead>
            <tr key={this.getRandom()}>
              {keys.map((k) => (
                <th key={this.getRandom()}><u>{enums.find(e => e.key === k).label}</u></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={ this.getRandom() }>
                {keys.map((k) => (
                  <td key={ this.getRandom() } style={{ width: `${length}%` }}>{!this.hasSavedAnswers() ? <br /> : null}
                  {item[k]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </li>
    );
  }

  getTableEnums (id, keys, enums, title) {
    // This is called if a table is empty
    const length = parseInt(100 / enums.length);
    let def = '__________________________________________';
    if (this.hasSavedAnswers()) {
      def = 'no answer';
    }
    return (
      <li key={this.getRandom()} style={{ marginTop: '3px', marginBottom: '3px' }}>
        {
          this.state.clone
            ? this.getCheckbox(id, def, false, true, title)
            : null
        }
        <table style={{ minWidth: '100%' }}>
          <thead>
            <tr key={this.getRandom()}>
              {keys.map((k) => (
                <th key={this.getRandom()}><u>{enums.find(e => e.key === k).label}</u></th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr key={ this.getRandom() }>
              {keys.map((k) => (
                <td key={ this.getRandom() } style={{ width: `${length}%` }}>{!this.hasSavedAnswers() ? <br /> : null}
                {def}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </li>
    );
  }

  getCheckbox (id, answer, bbox = false, table = false, title = '') {
    let checked = false;
    if (answer !== 'no answer' && answer !== '__________________________________________') {
      checked = true;
    }
    return (
      <><div key={this.getRandom()} style={{ width: '25px', display: 'inline-block', float: 'left' }}>
        <input id={`${id}_checkbox`} className='checkbox' type='checkbox' defaultChecked={checked} data-type-bbox={bbox} />
      </div><div style={{ width: '1000px', float: 'left' }}>
          {table
            ? `Copy "${title}" table`
            : null}
        </div></>
    );
  }

  getBbox (id) {
    let bbox = '';
    const n = `${id}_north`;
    const s = `${id}_south`;
    const e = `${id}_east`;
    const w = `${id}_west`;
    if (this.hasSavedAnswers()) {
      const data = this.props.requests.detail.data.form_data;
      if (typeof data[n] !== 'undefined' && data[n] !== '') {
        bbox += `N:  ${data[n]} `;
      }
      if (typeof data[e] !== 'undefined' && data[e] !== '') {
        bbox += `E:  ${data[e]} `;
      }
      if (typeof data[s] !== 'undefined' && data[s] !== '') {
        bbox += `S:  ${data[s]} `;
      }
      if (typeof data[w] !== 'undefined' && data[w] !== '') {
        bbox += `W:  ${data[w]}`;
      }
    } else {
      bbox += 'N:  _______  ';
      bbox += 'E:  _______  ';
      bbox += 'S:  _______  ';
      bbox += 'W:  _______  ';
    }
    if (bbox !== '') {
      return bbox;
    } else {
      return 'no answer';
    }
  }

  keyLookup(e, fileName) {
    e.preventDefault();
    if (this.state.keys[fileName]) {
      const { dispatch } = this.props;
      const requestId = this.props.location.search.split('=')[1];

      if (requestId !== '' && requestId != undefined && requestId !== null) {
        const { apiRoot, useCUEUpload } = _config;
        const download = (useCUEUpload?.toLowerCase?.() === 'false' ? new LocalUpload() : new CueFileUtility());

        download.downloadFile(this.state.keys[fileName], `${apiRoot}data/upload/downloadUrl`, loadToken().token).then((resp) => {
          let error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error
          if (error) {
            console.log(`An error has occurred: ${error}.`);
          }
        })
      }
    }
  };


  getFileList(controlId) {
  // Make sure files is always an array
  const files = this.state.files || [];

  // Filter files based on controlId
  let filteredFiles = files;
  if (controlId === 'data_product_documentation') {
    filteredFiles = files.filter(item => item.category === 'documentation');
  } else if (controlId === 'example_files') {
    filteredFiles = files.filter(item => item.category === 'sample');
  }

  // Return the list using map
  return filteredFiles.map(item => (
    <li key={this.getRandom()} style={{ marginTop: '3px', marginBottom: '3px' }}>
      <div key={this.getRandom()} style={{ width: '50%', display: 'inline-block', float: 'left' }}>
        Uploaded File:
      </div>
      <div key={this.getRandom()}>
        <a onClick={e => this.keyLookup(e, item.file_name)}>{item.file_name}</a>
      </div>
    </li>
  ));
}

  async getUploadedFiles(requestId) {
    const { dispatch } = this.props;
    if (requestId !== '' && requestId != undefined && requestId !== null) {
      await dispatch(listFileUploadsBySubmission(requestId))
        .then((resp) => {
          if (JSON.stringify(resp) === '{}' || JSON.stringify(resp) === '[]' || (resp.data && resp.data.length === 0)) {
            return
          }
          let error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error
          if (error){
            if (!error.match(/not authorized/gi) && !error.match(/not implemented/gi)) {
              const str = `An error has occurred while getting the list of files: ${error}.`;
              console.log(str)
              return
            } else {
              return
            }
          }
  
          const files = Array.isArray(resp.data) ? resp.data : [];

          files.sort(function (a, b) {
            var keyA = new Date(a.lastModified),
              keyB = new Date(b.lastModified);
            if (keyA > keyB) return -1;
            if (keyA < keyB) return 1;
            return 0;
          });

          this.setState({ files: files })
          
          const keyDict = {};

          for (const ea in files) {
            const fileName = files[ea].file_name;
            if (files[ea] === undefined || fileName === undefined) {
              break
            }
            const key = files[ea].key;
            keyDict[`${fileName}`] = key
          }

          this.setState({ keys: keyDict })
        });
      }
  }

  renderQuestions (formName, sections, whatSection) {
    let section = '';
    const sectionQuestions = [];
    const hasAnswers = this.hasSavedAnswers();
    for (const i in sections) {
      if (JSON.stringify(sections[i]) === '[]') { continue; }
      section = sections[i].heading;
      if (whatSection !== section) {
        continue;
      }
      sectionQuestions.push(<li key={this.getRandom()}><strong key={this.getRandom()}>{section}</strong></li>);
      for (const q in sections[i]) {
        if (JSON.stringify(sections[i][q]) === '[]') { continue; }
        try {
          const question = sections[i][q];
          if (Array.isArray(question)) {
            for (const b in question) {
              sectionQuestions.push(<li key={this.getRandom()}><br /></li>);
              sectionQuestions.push(<li style={{ textDecoration: 'underline' }} key={this.getRandom()}>{question[b].long_name}</li>);
              sectionQuestions.push(<li key={this.getRandom()}>{question[b].text}</li>);
              if (question[b].inputs) {
                for (const a in question[b].inputs) {
                  if (question[b].inputs[a].type === 'bbox') {
                    sectionQuestions.push(
                      <li key={this.getRandom()} style={{ marginTop: '3px', marginBottom: '3px' }}>
                        {!hasAnswers ? <br /> : null}
                        {
                          this.state.clone
                            ? this.getCheckbox(question[b].inputs[a].control_id, this.getBbox(question[b].inputs[a].control_id), true)
                            : null
                        }
                        <div key={this.getRandom()}>{this.getBbox(question[b].inputs[a].control_id)}</div>
                      </li>
                    );
                  } else if (question[b].inputs[a].type === 'table') {
                    let limitedEnums  = question[b].inputs[a].enums;
                    if (formName === 'Data Accession Request') limitedEnums = [...question[b].inputs[a].enums].slice(0, 4);
                    const keys = limitedEnums.map(e => e.key);
                    let data = [];
                    if (hasAnswers) {
                      data = this.props.requests.detail.data.form_data;
                    }
                    sectionQuestions.push(<li key={this.getRandom()}><br /></li>);
                    if (typeof data[question[b].inputs[a].control_id] !== 'undefined' && data[question[b].inputs[a].control_id].length !== 0) {
                      sectionQuestions.push(
                        this.getQuestionEnums(question[b].inputs[a].control_id, keys, limitedEnums, data[question[b].inputs[a].control_id], question[b].long_name)
                      );
                    } else {
                      sectionQuestions.push(
                        this.getTableEnums(question[b].inputs[a].control_id, keys, limitedEnums, question[b].long_name)
                      );
                    }
                  } else if (question[b].inputs[a].type === 'file'){
                      sectionQuestions.push(
                        this.getFileList(question[b].inputs[a]?.control_id)
                        );
                  } else {
                    sectionQuestions.push(
                      <li key={this.getRandom()} style={{ marginTop: '3px', marginBottom: '3px' }}>
                        {!hasAnswers ? <br /> : null}
                        {
                          this.state.clone
                            ? this.getCheckbox(question[b].inputs[a].control_id, this.getAnswer(question[b].inputs[a].control_id))
                            : null
                        }
                        <div key={this.getRandom()} style={{ width: '50%', display: 'inline-block', float: 'left' }}>
                        {!question[b].inputs[a].label ? 'Response' : question[b].inputs[a].label}:</div><div key={this.getRandom()}>{this.getAnswer(question[b].inputs[a].control_id)}</div>
                      </li>
                    );
                  }
                }
              }
            }
          }
        } catch (err) {
          console.log(err);
        }
      }
      if (section !== '') {
        sectionQuestions.push(<li key={this.getRandom()}><br /></li>);
        sectionQuestions.push(<li key={this.getRandom()}><hr /></li>);
        sectionQuestions.push(<li key={this.getRandom()}><br /></li>);
        return (sectionQuestions);
      }
    }
  }

  hasStepData () {
    if (typeof this.props.requests !== 'undefined' &&
    typeof this.props.requests.detail.data !== 'undefined' &&
    typeof this.props.requests.detail.data.step_data !== 'undefined') {
      return true;
    } else {
      return false;
    }
  }

  async printForm () {
    const hideItems = ['div.sidebar', 'div.header', 'div.content__header', 'div.app__target--container', 'div.th-wrapper', 'img', 'button', 'a.button', 'section.page__section--top', 'footer', 'hr:last-child'];
    if (typeof this.props.requests !== 'undefined' &&
      typeof this.props.requests.detail.data !== 'undefined' &&
      typeof this.props.requests.detail.data.step_data !== 'undefined') {
      for (const ea in hideItems) {
        const el = document.querySelectorAll(hideItems[ea]);
        for (const i in el) {
          if (typeof el[i].classList !== 'undefined') {
            if (!el[i].classList.contains('hidden')) {
              el[i].classList.add('hidden');
            }
          }
        }
      }
      
      const fileName = this.props.requests.detail.data?.form_data?.dar_form_project_name_info ||
        (this.props.requests.detail.data?.form_data?.data_product_name_value
          ? this.props.requests.detail.data?.form_data?.data_product_name_value
      : 'Request Initialized by ' + this.props.requests.detail.data.initiator.name);

      document.title = fileName;
      window.print(); 
    }
  }

  async handleDelete(review) {
    this.setState({isAddReviewerDisabled: true, loading: true}); 
    const payload = {
      'id': review.submission_id,
      'step_name': review.step_name,
      'user_list': [review.edpuser_id]
    }
    await this.props.dispatch(deleteStepReviewApproval(payload));
    
    let reviewersList = await this.props.dispatch(listRequestReviewers(review.submission_id));
    const dataFilter = this.props.requests.detail.data.step_name;
    const filteredData = reviewersList.data.filter(item => item.step_name === dataFilter);

    this.setState({filteredReviewers: filteredData});
    this.setState({isAddReviewerDisabled: false, loading: false});
  }

  handleCloseModal = () => {
    if(this.state.showErrorModal){
      this.setState({ showErrorModal: false });
      window.location.href = urlReturn;
    }
    this.setState({ showModal: false});
  };

  handleShowModal = () => {
    this.setState({ showModal: true });
  };

  async handleAddReviewer() {
    this.setState({isAddReviewerDisabled: true, loading: true});
    const reviewerValues = this.state.selectedReviewers.map(reviewer => reviewer.value);  
    const payload = {
      'id': this.props.location.search.split('=')[1],
      'step_name': this.props.requests.detail.data.step_name,
      'user_list': reviewerValues,
      'daac_id': this.props.requests.detail.data.daac_id
    }

    await this.props.dispatch(createStepReviewApproval(payload));

    let reviewersList = await this.props.dispatch(listRequestReviewers(this.props.location.search.split('=')[1]));
    const dataFilter = this.props.requests.detail.data.step_name;
    const filteredData = reviewersList.data.filter(item => item.step_name === dataFilter);

    this.setState({filteredReviewers: filteredData});
    this.setState({ selectedReviewers: [] });
    this.setState({isAddReviewerDisabled: false, loading: false});
    this.handleShowModal();
  }

  handleSelectChange = (selectedReviewers) => {
    this.setState({ selectedReviewers });
  }

  getReviewerOptions() {
    const existingUserIds = this.state.filteredReviewers.map(user => user.edpuser_id);
    const filteredUsers = this.state.allUsers.data?.filter(user => !existingUserIds.includes(user.id));
    return filteredUsers ? filteredUsers.map(user => ({ value: user.id, label: user.name, info: { extension: user.extension, groups: user.user_groups, roles: user.user_roles} })) : [];
  }

  capitalizeFirstLetter = (string) => {
    return string && string.length > 0? string.charAt(0).toUpperCase() + string.slice(1):"";
  }

  render () {
    let reviewable = false;
    const search = new URLSearchParams(this.props.location.search);
    let { canReview } = requestPrivileges(this.props.privileges, search.get('step'));
    let sameFormAsStep = false;
    let requestId = this.props.location.search.split('=')[1];
    const formId = this.props.match.params.formId;
    const record = this.props.forms.map[formId];
    if (!record || (record.inflight && !record.data)) {
      return (
        <>
          {this.state.showErrorModal ? (
            <Modal show={this.state.showErrorModal} onHide={this.handleCloseModal} className="custom-modal">
              <Modal.Header closeButton>
                <Modal.Title>Form Data Unavailable</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {this.state.errorMessage}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="primary" onClick={this.handleCloseModal}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          ) : (
            <Loading />
          )}
        </>
      );      
    } else if (record.error) {
      return <ErrorReport report={record.error} truncate={true} />;
    }
    if(this.state.loading){
      return <Loading />;
    }
    const form = record.data;
    const errors = this.errors();
    const sections = form.sections;
    const newSections = [];
    for (const ea in sections) {
      for (const i in sections[ea]) {
        if (JSON.stringify(sections[ea][i]) !== '[]' && typeof sections[ea][i] === 'string') {
          newSections.push(this.renderQuestions(form.long_name, sections, sections[ea][i]));
        }
      }
    }
    if (this.hasStepData()) {
      if (typeof this.props.requests.detail.data !== 'undefined') {
        const formName = record.data.short_name;
        requestId = this.props.requests.detail.data.id;
        if (this.props.requests.detail.data.step_name?.match(/close/g)) {
          sameFormAsStep = false;
          if (!canReview) {
            canReview = false;
          }
        }
        if (this.props.requests.detail.data.step_name === `${formName}_form`) {
          sameFormAsStep = true;
          canReview = false;
        } else if (this.props.requests.detail.data.step_name?.match(/form_(.*_)?review/g)) {
          if (canReview) {
            reviewable = true;
          }
          const regexStr = new RegExp(`${formName}_form_(.*_)?review`, 'g');
          if (this.props.requests.detail.data.step_name?.match(regexStr)) {
            sameFormAsStep = true;
          }
        }
      }
    }
    return (
      <div className='page__component'>
        <section className='page__section page__section__header-wrapper'>
          <h1 className='heading--large heading--shared-content with-description'>{form.long_name}</h1>
          {requestId !== ''
            ? <button onClick={() => { this.printForm(); window.location.reload(); }}
                className='button button--small button--green button--print form-group__element--right'>
                Print
              </button>
            : null}
        </section>
        {canReview ? 
        <div className="review-section" style={{ marginTop: '10px', float: 'right', fontSize: '90%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <table className='review-table' style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  <th style={{padding: '0 1em 0 0'}}>Reviewer</th>
                  <th style={{padding: '0 1em 0 0'}}>Approval Status</th>
                  <th>Delete Reviewer</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={3}><hr style={{ width: '100%', border: '1px solid #ccc', margin: '0' }} /></td></tr>
                { this.state.filteredReviewers.length > 0 ? (
                  this.state.filteredReviewers.map((review, index) => (
                    <tr key={index} style={{textAlign: 'left', textWrap: 'pretty'}}>
                      <td style={{padding: '0 1em 0 0'}}>{review.name}</td>
                      <td style={{padding: '0 1em 0 0'}}>{review.user_review_status && review.user_review_status === 'review_required'? 'Review Required':this.capitalizeFirstLetter(review.user_review_status)}</td>
                      <td style={{textAlign: 'center'}}>
                        <button
                          className={'button--red button--remove button button__animation--md button__arrow button__arrow--md button__animation button--secondary'}
                          style={{ marginTop: '5px' }}
                          onClick={() => this.handleDelete(review)}
                          disabled={this.state.isAddReviewerDisabled}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: ' 1em 0 0 0' }}>No Reviewer Assigned</td>
                  </tr>
                )}
              </tbody>
            </table>
              <hr style={{ width: '100%', margin: '10px 0' }} />
              <Select
                isMulti
                options={this.getReviewerOptions()}
                value={this.state.selectedReviewers}
                onChange={this.handleSelectChange}
                placeholder="Select Reviewers..."
                components={{ Option: CustomOption }}
              />
              <div className='questions-component' style={{ textAlign: 'right', marginTop: '5px', backgroundColor: 'unset' }}>
                <button
                  className='button button--add button__animation--md button__arrow button__arrow--md button__animation button__arrow--white review-required'
                  onClick={() => this.handleAddReviewer()}
                  disabled={this.state.isAddReviewerDisabled || (this.state.selectedReviewers && this.state.selectedReviewers.length === 0)}
                >
                  Add Reviewer(s)
                </button>
              </div>
            </div>
        </div> : ''}
        <div style={{ clear: 'both' }}></div>
        <section className='page__section'>
          {errors.length ? <ErrorReport report={errors} truncate={true} /> : null}
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium with-description'>Form Data</h2>
          </div>
          <Metadata data={form} accessors={metaAccessors} />
        </section>

        <section className='page__section'>
          {errors.length ? <ErrorReport report={errors} truncate={true} /> : null}
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium with-description'>Questions</h2>
          </div>
          <div>
            <ul>
              {newSections}
            </ul>
          </div>
        </section>
        <section className='page_section'>
          {this.state.clone
            ? <div className='flex__row reject-approve'>
                <div className='flex__item--spacing'>
                  <button onClick={() => this.navigateBack()}
                      className='button button--cancel button__animation--md button__arrow button__arrow--md button__animation button--secondary form-group__element--right'>
                      Cancel
                  </button>
                </div>
                <div className='flex__item--spacing'>
                  <button onClick={() => this.cloneRequest()}
                      className='button button--copy button__animation--md button__arrow button__arrow--md button__animation button__arrow--white form-group__element--right'>
                      Clone Request
                  </button>
                </div>
              </div>
            : null }
            {requestId !== ''
              ? <><Comments /></>
              : null
            }
            {requestId !== '' && reviewable && sameFormAsStep
              ? <><ReviewStep /></>
              : null
            }
        </section>
        <Modal show={this.state.showModal} onHide={this.handleCloseModal} className="custom-modal">
          <Modal.Header closeButton>
            <Modal.Title>Reviewers Notified</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            The selected reviewers have been notified via email.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={this.handleCloseModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

FormOverview.propTypes = {
  match: PropTypes.object,
  dispatch: PropTypes.func,
  forms: PropTypes.object,
  requests: PropTypes.object,
  logs: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  privileges: PropTypes.object,
  params: PropTypes.object
};

FormOverview.displayName = 'FormElem';

export default withRouter(connect(state => ({
  forms: state.forms,
  requests: state.requests,
  privileges: state.api.tokens.privileges,
  logs: state.logs
}))(FormOverview));