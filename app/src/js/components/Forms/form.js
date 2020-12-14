'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  interval,
  getForm,
  deleteForm
} from '../../actions';
import { get } from 'object-path';
import {
  fromNow,
  lastUpdated
} from '../../utils/format';
import Loading from '../LoadingIndicator/loading-indicator';
import ErrorReport from '../Errors/report';
import Metadata from '../Table/Metadata';
import _config from '../../config';

const { updateInterval } = _config;

const metaAccessors = [
  {
    label: 'User Name',
    property: 'userName',
  },
  {
    label: 'Created',
    property: 'createdAt',
    accessor: fromNow
  },
  {
    label: 'Updated',
    property: 'updatedAt',
    accessor: fromNow
  }
];

class FormOverview extends React.Component {
  constructor () {
    super();
    this.reload = this.reload.bind(this);
    this.navigateBack = this.navigateBack.bind(this);
    this.delete = this.delete.bind(this);
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
    const { dispatch } = this.props;
    if (this.cancelInterval) { this.cancelInterval(); }
    this.cancelInterval = interval(() => dispatch(getForm(formId)), timeout, immediate);
  }

  navigateBack () {
    const { history } = this.props;
    history.push('/forms');
  }

  delete () {
    const { formId } = this.props.match.params;
    const form = this.props.forms.map[formId].data;
    if (!form.published) {
      this.props.dispatch(deleteForm(formId));
    }
  }

  errors () {
    const formId = this.props.match.params.formId;
    return [
      get(this.props.forms.map, [formId, 'error']),
      get(this.props.forms.deleted, [formId, 'error'])
    ].filter(Boolean);
  }

  getRandom () {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  getAnswer (id) {
    const formId = this.props.match.params.formId;
    const record = this.props.forms.map[formId];
    const form = record.data;
    return (form.form_data[id]);
  }

  renderQuestions (sections, whatSection) {
    for (const ea in sections) {
      let section = '';
      const sectionQuestions = [];
      for (const i in sections[ea]) {
        if (typeof sections[ea][i] === 'string') {
          section = sections[ea][i];
          if (whatSection !== section) {
            continue;
          }
          sectionQuestions.push(<li key={this.getRandom()}><strong>{section}</strong></li>);
        } else if (typeof sections[ea][i] === 'object') {
          for (const q in sections[ea][i]) {
            try {
              const question = sections[ea][i][q];
              sectionQuestions.push(<li key={this.getRandom()}>{question.title}</li>);
              sectionQuestions.push(<li key={this.getRandom()}>{question.text}</li>);
              if (question.inputs) {
                for (const a in question.inputs) {
                  sectionQuestions.push(
                    <li key={ this.getRandom() } style={{ marginTop: '3px', marginBottom: '3px' }}>
                      <div style={{ width: '22.5%', display: 'inline-block', float: 'left' }}>{question.inputs[a].label}:</div>
                      <div>{this.getAnswer(question.inputs[a].id)}</div>
                    </li>
                  );
                }
              }
            } catch (err) {
              console.log(err);
            }
          }
        }
        if (section !== '') {
          sectionQuestions.unshift(sectionQuestions.pop());
          sectionQuestions.push(<li><br key={this.getRandom()} /></li>);
          sectionQuestions.push(<li><hr key={this.getRandom()} /></li>);
          sectionQuestions.push(<li><br key={this.getRandom()} /></li>);
          return (sectionQuestions);
        }
      }
    }
  }

  render () {
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
        newSections.push(this.renderQuestions(sections, sections[ea][i]));
      }
    }

    return (
      <div className='page__component'>
        <section className='page__section page__section__header-wrapper'>
          <h1 className='heading--large heading--shared-content with-description'>{form.name} (Verson {form.version})</h1>
          {lastUpdated(form.updatedAt)}
          <a className='button button--small button--green button--edit form-group__element--right' href={_config.formsUrl}>Edit</a>
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
  logs: PropTypes.object,
  history: PropTypes.object
};

FormOverview.displayName = 'FormElem';

export default withRouter(connect(state => ({
  forms: state.forms,
  logs: state.logs
}))(FormOverview));
