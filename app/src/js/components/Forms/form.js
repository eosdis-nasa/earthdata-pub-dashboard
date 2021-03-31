'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  interval,
  getForm,
  getRequest
} from '../../actions';
import { get } from 'object-path';
import {
  shortDateNoTimeYearFirst
} from '../../utils/format';
import Loading from '../LoadingIndicator/loading-indicator';
import ErrorReport from '../Errors/report';
import Metadata from '../Table/Metadata';
import _config from '../../config';

const { updateInterval } = _config;

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
    this.reload = this.reload.bind(this);
    this.navigateBack = this.navigateBack.bind(this);
    this.errors = this.errors.bind(this);
  }

  componentDidMount () {
    const { formId } = this.props.match.params;
    const immediate = !this.props.forms.map[formId];
    this.reload(immediate);
  }

  componentWillUnmount () {
    if (this.cancelInterval) { this.cancelInterval(); }
  }

  reload (immediate, timeout) {
    timeout = timeout || updateInterval;
    const formId = this.props.match.params.formId;
    const requestId = this.props.location.search.split('=')[1];
    const { dispatch } = this.props;
    if (this.cancelInterval) { this.cancelInterval(); }
    this.cancelInterval = interval(() => {
      dispatch(getRequest(requestId));
      dispatch(getForm(formId));
    }, timeout, immediate);
  }

  navigateBack () {
    const { history } = this.props;
    history.push('/forms');
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
    if (typeof this.props.requests.detail.data.form_data[id] !== 'undefined' && this.props.requests.detail.data.form_data[id] !== '') {
      return (this.props.requests.detail.data.form_data[id]);
    } else {
      return 'no answer';
    }
  }

  getBbox (id) {
    let out = '';
    const n = `${id}_north`;
    const s = `${id}_south`;
    const e = `${id}_east`;
    const w = `${id}_west`;
    if (typeof this.props.requests.detail.data.form_data[n] !== 'undefined' && this.props.requests.detail.data.form_data[n] !== '') {
      out += `N:  ${this.props.requests.detail.data.form_data[n]} `;
    }
    if (typeof this.props.requests.detail.data.form_data[e] !== 'undefined' && this.props.requests.detail.data.form_data[e] !== '') {
      out += `E:  ${this.props.requests.detail.data.form_data[e]} `;
    }
    if (typeof this.props.requests.detail.data.form_data[s] !== 'undefined' && this.props.requests.detail.data.form_data[s] !== '') {
      out += `S:  ${this.props.requests.detail.data.form_data[s]} `;
    }
    if (typeof this.props.requests.detail.data.form_data[w] !== 'undefined' && this.props.requests.detail.data.form_data[w] !== '') {
      out += `W:  ${this.props.requests.detail.data.form_data[w]}`;
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
                      <li key={ this.getRandom() } style={{ marginTop: '3px', marginBottom: '3px' }}>
                        <div key={this.getRandom()}>{this.getBbox(question[b].inputs[a].control_id)}</div>
                      </li>
                    );
                  } else {
                    sectionQuestions.push(
                      <li key={ this.getRandom() } style={{ marginTop: '3px', marginBottom: '3px' }}>
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
    const formId = this.props.match.params.formId;
    const record = this.props.forms.map[formId];
    let requestId = '';
    let daacId = '';
    if (typeof this.props.requests.detail.data !== 'undefined') {
      daacId = this.props.requests.detail.data.daac_id;
      requestId = this.props.requests.detail.data.id;
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
          <a className='button button--small button--green button--edit form-group__element--right' href={thisFormUrl}>Edit</a>
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
  params: PropTypes.object
};

FormOverview.displayName = 'FormElem';

export default withRouter(connect(state => ({
  forms: state.forms,
  requests: state.requests,
  logs: state.logs
}))(FormOverview));
