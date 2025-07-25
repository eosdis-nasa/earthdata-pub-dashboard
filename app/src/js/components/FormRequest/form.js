'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  getForm,
  getRequest,
  copyRequest
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
import localUpload from '@edpub/upload-utility';

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
    this.state = { clone: false };
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
        const download = new localUpload();
        const { apiRoot } = _config;
        download.downloadFile(this.state.keys[fileName], `${apiRoot}data/upload/downloadUrl`, loadToken().token).then((resp) => {
          let error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error
          if (error) {
            console.log(`An error has occurred: ${error}.`);
          }
        })
      }
    }
  };

  getFileList(){
    // TODO once the api is updated to split the file types this will need to take that into account
    let files = this.state.files
    let displayList = [];

    if (Array.isArray(files)){        
          files.map((item) => (
            displayList.push (
              <li key={this.getRandom()} style={{ marginTop: '3px', marginBottom: '3px' }}>
                <div key={this.getRandom()} style={{ width: '50%', display: 'inline-block', float: 'left' }}>Uploaded File:</div>
                <div key={this.getRandom()}><a onClick={(e) => this.keyLookup(e, item.file_name)}>{item.file_name}</a></div>
              </li>
            )
        ))

      return displayList;

    }

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
  
          const files = resp.data;

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

  renderQuestions (sections, whatSection) {
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
                    const keys = question[b].inputs[a].enums.map(e => e.key);
                    let data = [];
                    if (hasAnswers) {
                      data = this.props.requests.detail.data.form_data;
                    }
                    sectionQuestions.push(<li key={this.getRandom()}><br /></li>);
                    if (typeof data[question[b].inputs[a].control_id] !== 'undefined' && data[question[b].inputs[a].control_id].length !== 0) {
                      sectionQuestions.push(
                        this.getQuestionEnums(question[b].inputs[a].control_id, keys, question[b].inputs[a].enums, data[question[b].inputs[a].control_id], question[b].long_name)
                      );
                    } else {
                      sectionQuestions.push(
                        this.getTableEnums(question[b].inputs[a].control_id, keys, question[b].inputs[a].enums, question[b].long_name)
                      );
                    }
                  } else if (question[b].inputs[a].type === 'file'){
                      sectionQuestions.push(
                        this.getFileList()
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
      window.print();
    }
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
      return <Loading />;
    } else if (record.error) {
      return <ErrorReport report={record.error} truncate={true} />;
    }
    const form = record.data;
    const errors = this.errors();
    const sections = form.sections;
    const newSections = [];
    for (const ea in sections) {
      for (const i in sections[ea]) {
        if (JSON.stringify(sections[ea][i]) !== '[]' && typeof sections[ea][i] === 'string') {
          newSections.push(this.renderQuestions(sections, sections[ea][i]));
        }
      }
    }
    if (this.hasStepData()) {
      if (typeof this.props.requests.detail.data !== 'undefined') {
        const formName = record.data.short_name;
        requestId = this.props.requests.detail.data.id;
        if (this.props.requests.detail.data.step_name.match(/close/g)) {
          sameFormAsStep = false;
          if (!canReview) {
            canReview = false;
          }
        }
        if (this.props.requests.detail.data.step_name === `${formName}_form`) {
          sameFormAsStep = true;
          canReview = false;
        } else if (this.props.requests.detail.data.step_name.match(/form_review/g)) {
          if (canReview) {
            reviewable = true;
          }
          if (this.props.requests.detail.data.step_name === `${formName}_form_review`) {
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
