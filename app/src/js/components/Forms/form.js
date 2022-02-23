'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  getForm,
  getRequest,
  reviewRequest
} from '../../actions';
import { get } from 'object-path';
import {
  shortDateNoTimeYearFirst
} from '../../utils/format';
import { strings } from '../locale';
import Loading from '../LoadingIndicator/loading-indicator';
import ErrorReport from '../Errors/report';
import Metadata from '../Table/Metadata';
import { formPrivileges, requestPrivileges } from '../../utils/privileges';
import _config from '../../config';

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
    this.displayName = strings.form;
    this.state = {};
  }

  componentDidMount () {
    const requestId = this.props.location.search.split('=')[1];
    const { formId } = this.props.match.params;
    const { dispatch } = this.props;
    dispatch(getForm(formId));
    dispatch(getRequest(requestId));
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

  hasStepData () {
    if (typeof this.props.requests !== 'undefined' &&
    typeof this.props.requests.detail.data !== 'undefined' &&
    typeof this.props.requests.detail.data.step_data !== 'undefined') {
      return true;
    } else {
      return false;
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

  getQuestionEnums (keys, enums, id) {
    const length = parseInt(100 / enums.length);
    return (
      <li key={this.getRandom()} style={{ marginTop: '3px', marginBottom: '3px' }}>
        <table style={{ minWidth: '100%' }}>
          <thead>
            <tr key={this.getRandom()}>
              {keys.map((k) => (
                <th key={this.getRandom()}><u>{enums.find(e => e.key === k).label}</u></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {id.map((item) => (
              <tr key={ this.getRandom() }>
                {keys.map((k) => (
                  <td key={ this.getRandom() } style={{ width: `${length}%` }}>{!this.hasSavedAnswers() ? <br /> : null}{item[k]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </li>
    );
  }

  getTableEnums (keys, enums) {
    const length = parseInt(100 / enums.length);
    let def = '__________________________________________'
    if (this.hasSavedAnswers()) {
      def = 'no answer';
    }
    return (
      <li key={this.getRandom()} style={{ marginTop: '3px', marginBottom: '3px' }}>
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
                <td key={ this.getRandom() } style={{ width: `${length}%` }}>{!this.hasSavedAnswers() ? <br /> : null}{def}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </li>
    );
  }

  getBbox (id) {
    let out = '';
    const n = `${id}_north`;
    const s = `${id}_south`;
    const e = `${id}_east`;
    const w = `${id}_west`;
    if (this.hasSavedAnswers()) {
      const data = this.props.requests.detail.data.form_data;
      if (typeof data[n] !== 'undefined' && data[n] !== '') {
        out += `N:  ${data[n]} `;
      }
      if (typeof data[e] !== 'undefined' && data[e] !== '') {
        out += `E:  ${data[e]} `;
      }
      if (typeof data[s] !== 'undefined' && data[s] !== '') {
        out += `S:  ${data[s]} `;
      }
      if (typeof data[w] !== 'undefined' && data[w] !== '') {
        out += `W:  ${data[w]}`;
      }
    } else {
      out += 'N:  _______  ';
      out += 'E:  _______  ';
      out += 'S:  _______  ';
      out += 'W:  _______  ';
    }
    if (out !== '') {
      return out;
    } else {
      return 'no answer';
    }
  }

  renderQuestions (sections, whatSection) {
    let section = '';
    const sectionQuestions = [];
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
                        {!this.hasSavedAnswers() ? <br /> : null}
                        <div key={this.getRandom()}>{this.getBbox(question[b].inputs[a].control_id)}</div>
                      </li>
                    );
                  } else if (question[b].inputs[a].type === 'table') {
                    const keys = question[b].inputs[a].enums.map(e => e.key);
                    let data = [];
                    if (this.hasSavedAnswers()) {
                      data = this.props.requests.detail.data.form_data;
                    }
                    sectionQuestions.push(<li key={this.getRandom()}><br /></li>);
                    if (typeof data[question[b].inputs[a].control_id] !== 'undefined' && data[question[b].inputs[a].control_id].length !== 0) {
                      sectionQuestions.push(
                        this.getQuestionEnums(keys, question[b].inputs[a].enums, data[question[b].inputs[a].control_id])
                      );
                    } else {
                      sectionQuestions.push(
                        this.getTableEnums(keys, question[b].inputs[a].enums)
                      );
                    }
                  } else {
                    sectionQuestions.push(
                      <li key={this.getRandom()} style={{ marginTop: '3px', marginBottom: '3px' }}>
                        {!this.hasSavedAnswers() ? <br /> : null}
                        <div key={this.getRandom()} style={{ width: '22.5%', display: 'inline-block', float: 'left' }}>{question[b].inputs[a].label}:</div>
                        <div key={this.getRandom()}>{this.getAnswer(question[b].inputs[a].control_id)}</div>
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

  render () {
    const dispatch = this.props.dispatch;
    const { canReview } = requestPrivileges(this.props.privileges);
    const { canEdit } = formPrivileges(this.props.privileges);
    let requestId = this.props.location.search.split('=')[1];
    const formId = this.props.match.params.formId;
    const record = this.props.forms.map[formId];
    let daacId = '';
    let reviewReady = false;
    if (this.hasStepData()) {
      const request = this.props.requests.detail.data;
      reviewReady = request &&
        request.step_data.type === 'review' &&
        request.step_data.data.type === 'form' &&
        request.step_data.data.form_id === formId;
      if (typeof this.props.requests.detail.data !== 'undefined') {
        daacId = this.props.requests.detail.data.daac_id;
        requestId = this.props.requests.detail.data.id;
      }
    }
    let thisFormUrl = `${_config.formsUrl}?formId=${formId}`;
    if (requestId !== '') {
      thisFormUrl += `&requestId=${requestId}`;
    }
    if (daacId !== '') {
      thisFormUrl += `&group=${daacId}`;
    }
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
    return (
      <div className='page__component'>
        <section className='page__section page__section__header-wrapper'>
          <h1 className='heading--large heading--shared-content with-description'>{form.long_name} (Verson {form.version})</h1>
          {requestId !== '' && canEdit && this.hasSavedAnswers() ? <a className='button button--small button--green button--edit form-group__element--right' href={thisFormUrl}>Edit</a> : null}
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
          { canReview && reviewReady && typeof requestId !== 'undefined' && (
            <div className='flex__row'>
              <div className='flex__item--spacing'>
                <button onClick={() => dispatch(reviewRequest(requestId, false))}
                  className='button button--no-icon button--medium button--green'>
                Reject
                </button>
              </div>
              <div className='flex__item--spacing'>
                <button onClick={() => dispatch(reviewRequest(requestId, true))}
                  className='button button--no-icon button--medium button--green'>
                Approve
                </button>
              </div>
            </div>
          )}
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
