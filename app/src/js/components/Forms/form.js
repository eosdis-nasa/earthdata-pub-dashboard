'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import {
  interval,
  getForm,
  deleteForm
} from '../../actions';
import { get } from 'object-path';
import {
  fromNow,
  lastUpdated,
  deleteText
} from '../../utils/format';
import Loading from '../LoadingIndicator/loading-indicator';
import LogViewer from '../Logs/viewer';
import AsyncCommands from '../DropDown/dropdown-async-command';
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
    /* this.props.dispatch(listCollections({
      limit: 100,
      fields: 'collectionName',
      forms: formId
    })); */
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

  getRandom(){
    return  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  getAnswer(id){
    const formId = this.props.match.params.formId;
    const record = this.props.forms.map[formId];
    const form = record.data;
    return (form.form_data[id])
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
    const sections = form.sections
    
    let question_items = []
    for (const ea in sections){
      let section = ''
      for (const i in sections[ea]){
        if (typeof sections[ea][i] == 'string'){
          section = sections[ea][i]
          question_items.push(<h2>{sections[ea][i]}</h2>)
        } else if (typeof sections[ea][i] == 'object'){
          for (const q in sections[ea][i]){
            try {
              const question = sections[ea][i][q]
              question_items.push(<li key={this.getRandom()}>{question.title}</li>)
              question_items.push(<li key={this.getRandom()}>{question.text}</li>)
              if (question.inputs){
                for (const a in question.inputs){
                  question_items.push(
                    <li key={this.getRandom()} style={{marginTop:'3px', marginBottom: '3px'}}>
                      <div style={{width: '22%', display: 'inline-block', float:'left'}}><strong>{question.inputs[a]['label']}:</strong></div>
                      <div>{this.getAnswer(question.inputs[a]['id'])}</div>
                    </li>
                  )
                }
              }
            } 
            catch(err) {
              console.log(err)
            }
          }
        }
      }
    }
    return (
      <div className='page__component'>
        <section className='page__section page__section__header-wrapper'>
          <h1 className='heading--large heading--shared-content with-description'>{form.name} (Verson {form.version})</h1>
          {lastUpdated(form.updatedAt)}
        </section>

        <section className='page__section'>
          {errors.length ? <ErrorReport report={errors} truncate={true} /> : null}
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium with-description'>Form Overview</h2>
          </div>
          <Metadata data={form} accessors={metaAccessors} />
        </section>

        <section className='page__section'>
          {errors.length ? <ErrorReport report={errors} truncate={true} /> : null}
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium with-description'>Questions</h2>
          </div>
          <div><ul>{question_items}</ul></div>
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
