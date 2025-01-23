'use strict';
import React from 'react';
import AceEditor from 'react-ace';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import {
  getWorkflow,
  updateWorkflow,
  addWorkflow
} from '../../actions';
import config from '../../config';
import Loading from '../LoadingIndicator/loading-indicator';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import ErrorReport from '../Errors/report';
import Demo from './workflow-builder';
import { listSteps } from '../../actions';

class Workflows extends React.Component {
  constructor () {
    super();
    this.state = { view: 'flow', data: '', flowData: null };
    this.refName = React.createRef();
    this.sectionRefName = React.createRef();
    this.renderWorkflowJson = this.renderWorkflowJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSaveFlow = this.handleSaveFlow.bind(this);
  }

  componentDidMount () {
    const { dispatch } = this.props;
    const { workflowId } = this.props.match.params;
    workflowId ? dispatch(getWorkflow(workflowId)) : null;
    dispatch(listSteps());
  }

  cancelWorkflow () {
    this.props.history.goBack();
  }

  handleSaveFlow(flowData) {
    this.setState({ flowData });
  }

  renderWorkflowJson (name, data, refName) {
    return (
            <AceEditor
                mode='json'
                theme={config.editorTheme}
                name={`edit-${name}`}
                value={JSON.stringify(data, null, '\t')}
                width='auto'
                tabSize={config.tabSize}
                showPrintMargin={false}
                minLines={2}
                maxLines={35}
                wrapEnabled={true}
                ref={refName}
            />
    );
  }

  async handleSubmit () {
    const { dispatch, match: { params: { workflowId } } } = this.props;
    const { flowData } = this.state;
    const workflow_aceEditorData = JSON.parse(flowData) || JSON.parse(this.refName.current.editor.getValue());
    this.setState({ data: workflow_aceEditorData });
    const payload = { ...workflow_aceEditorData };

    let wfResponse;
    if (workflowId) {
      await dispatch(updateWorkflow(payload));
    } else {
      wfResponse = await dispatch(addWorkflow(payload));
    }
    
    // Redirect to the new workflow's ID if available, otherwise fallback
    const newWorkflowId = wfResponse?.data?.id || workflow_aceEditorData.id;
    this.props.history.push(`/workflows/id/${newWorkflowId}`);    
  }

  getRandom () {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  render () {
    const { workflowId } = this.props.match.params;
    const record = (workflowId ? this.props.workflows.detail : { data: {} });
    const breadcrumbConfig = [
      {
        label: 'Dashboard Home',
        href: '/'
      },
      {
        label: 'Workflows',
        href: '/workflows'
      },
      {
        label: workflowId || 'Add Workflow',
        active: true
      }
    ];
  
  const stepsList = this.props.steps?.list?.data || null;
    return (
            <div className='page__component'>
                <section className='page__section page__section__controls'>
                    <Breadcrumbs config={breadcrumbConfig} />
                </section>
                <section className='page__section'>
                  <div className='heading__wrapper--border'>
                    <h2 className='heading--medium heading--shared-content with-description'>{record.data ? 'Workflow Overview' : 'Add Workflow'}</h2>
                  </div>
                </section>
                <section className='page__section'>
                    { record.inflight
                      ? <Loading />
                      : record.error
                        ? <ErrorReport report={record.error} />
                        : record.data
                          ? <div>
                                    <div className='tab--wrapper'>
                                        <button className={'button--tab ' + (this.state.view === 'json' ? 'button--active' : '')}
                                                onClick={() => this.state.view !== 'json' && this.setState({ view: 'json' })}>Workflow JSON</button>
                                        <button className={'button--tab ' + (this.state.view === 'flow' ? 'button--active' : '')}
                                                onClick={() => this.state.view !== 'flow' && this.setState({ view: 'flow' })}>Workflow Builder</button>
                                    </div>
                                    <div>
                                    {this.state.view === 'json' ? this.renderJson((this.state.data ? this.state.data : record.data), this.refName):<Demo initialFlowData={record.data && record.data.steps? record.data:null} initialNodeOptions={stepsList}  onSaveFlow={this.handleSaveFlow}/>}
                                    </div>
                                </div>
                          : null
                    }
                </section>
                <section className='page__section'>
                  <button
                    className={'button button--cancel button__animation--md button__arrow button__arrow--md button__animation button--secondary'}
                    id="cancelButton"
                    onClick={(e) => { e.preventDefault(); this.cancelWorkflow(); }}
                    >Cancel
                  </button>
                  <button className={'button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'}
                  onClick={this.handleSubmit} aria-label="submit your workflows">
                      Submit
                  </button>
                </section>
            </div>
    );
  }

  renderJson (data, refName) {
    return (
            <ul>
                <li>
                    <label>{data.long_name}
                    {this.renderWorkflowJson(`recipe_${this.getRandom()}`, data, refName)}</label>
                </li>
            </ul>
    );
  }
}

Workflows.propTypes = {
  match: PropTypes.object,
  workflows: PropTypes.object,
  dispatch: PropTypes.func,
  history: PropTypes.object,
  steps: PropTypes.object,
};

export default withRouter(connect(state => ({
  workflows: state.workflows,
  steps: state.steps
}))(Workflows));
