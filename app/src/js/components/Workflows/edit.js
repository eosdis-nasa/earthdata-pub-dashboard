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

class Workflows extends React.Component {
  constructor () {
    super();
    this.state = { view: 'json', data: '' };
    this.refName = React.createRef();
    this.sectionRefName = React.createRef();
    this.renderWorkflowJson = this.renderWorkflowJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount () {
    const { dispatch } = this.props;
    const { workflowId } = this.props.match.params;
    workflowId ? await dispatch(getWorkflow(workflowId)) : null;
  }

  cancelWorkflow () {
    this.props.history.goBack();
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
    const workflow_aceEditorData = JSON.parse(this.refName.current.editor.getValue());
    this.setState({ data: workflow_aceEditorData });
    const payload = Object.assign({}, workflow_aceEditorData);
    workflowId ? await dispatch(updateWorkflow(payload)) : await dispatch(addWorkflow(payload));
    // Adding workflows in not the api.  Cannot execute addWorkflow until it's there.
    this.props.history.push(`/workflows/id/${workflow_aceEditorData.id}`);
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
                    { <div>
                                    <div className='tab--wrapper'>
                                        <button className={'button--tab ' + (this.state?.view === 'json' ? 'button--active' : '')}
                                                onClick={() => this.state?.view !== 'json' && this.setState({ view: 'json' })}>Workflow JSON</button>
                                    </div>
                                    <div>
                                        {this.renderJson((this.state?.data ? this.state?.data : record.data), this.refName)}
                                    </div>
                                </div>
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
};

export default withRouter(connect(state => ({
  workflows: state.workflows
}))(Workflows));
