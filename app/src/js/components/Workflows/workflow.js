'use strict';
import React from 'react';
import AceEditor from 'react-ace';
import PropTypes from 'prop-types';
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { getWorkflow } from '../../actions';
import config from '../../config';
import { setWindowEditorRef } from '../../utils/browser';
import Loading from '../LoadingIndicator/loading-indicator';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import ErrorReport from '../Errors/report';
import { workflowToGraph } from './graph-utils';
import { userPrivileges } from '../../utils/privileges';
import { Modal, Button } from 'react-bootstrap';
import { listRequests } from '../../actions';

function onLoad (reactFlowInstance) {
  reactFlowInstance.fitView();
}

class Workflows extends React.Component {
  constructor () {
    super();
    this.state = {
      view: 'graph',
      nodes: [],
      edges: [],
      renderedGraph: false,
      showConfirmPopup: false,
      workflowRequestCount: 0
    };    
    this.renderReadOnlyJson = this.renderReadOnlyJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
    this.showGraph = this.showGraph.bind(this);
    this.hideGraph = this.hideGraph.bind(this);
    this.onConnect = this.onConnect.bind(this);
  }

  async componentDidMount () {
    const { dispatch } = this.props;
    const { workflowId } = this.props.match.params;
    dispatch(getWorkflow(workflowId));
    await dispatch(listRequests())
    const count = this.calculateWorkflowRequestCount(this.props.requests.list.data || [], workflowId);
    this.setState({ workflowRequestCount: count });
    setTimeout(() => {
      const record = this.props.workflows.detail;
      if (record?.data) {
        const graphData = workflowToGraph(record.data.steps);
        this.setState({ nodes: graphData[0], edges: graphData[1] });
      }
    }, 2000);
  }  

  calculateWorkflowRequestCount(data, workflowId) {
    return data.filter(item => item.workflow_id === workflowId).length;
  }
  
  showGraph () {
    if (document.getElementById('graph') !== null) {
      document.getElementById('graph').removeAttribute('class', 'hidden');
      const section = document.querySelector('section#graph');
      if (section !== null) {
        setTimeout(() => {
          /* const nodes = document.querySelectorAll('g .react-flow__edge'); */
          const nodes = document.querySelectorAll('.react-flow__node');
          let count = 1;
          for (const ea in nodes) {
            // eslint-disable-next-line no-prototype-builtins
            if (nodes.hasOwnProperty(ea)) {
              count++;
            }
          }
          // (edges) + (nodeHeight (mines always the same)) + (top of first node to breadcrumbs)
          section.style.height = ((count * 54) + (count * 40)) + 220 + 'px';
        }, '1000');
      }
    }
  }

  renderReadOnlyJson (name, data) {
    return (
      <AceEditor
        id="read-only-json"
        mode='json'
        theme={config.editorTheme}
        name={`read-only-${name}`}
        readOnly={true}
        value={JSON.stringify(data, null, '\t')}
        width='auto'
        tabSize={config.tabSize}
        showPrintMargin={false}
        minLines={1}
        maxLines={35}
        wrapEnabled={true}
        ref={setWindowEditorRef}
      />
    );
  }

  onConnect (params) {
    this.useCallback(
      (params) => this.setEdges((els) => this.addEdge(params, els)),
      []
    );
  }

  render () {
    const { workflowId } = this.props.match.params;
    const record = this.props.workflows.detail;
    const { canUpdateWorkflow } = userPrivileges(this.props.privileges);
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
        label: workflowId,
        active: true
      }
    ];
    let reactFlowStyle = {};
    if (record.data) {
      const box = document.querySelector('.page__content--shortened');
      const sidebar = document.querySelector('div.sidebar')?.offsetWidth;
      if (box !== null) {
        const width = box.offsetWidth;
        reactFlowStyle = {
          left: `${((width - 275) / 2) - sidebar}px`,
          position: 'relative'
        };
      }
    }
    return (
      <div className='page__component'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <section className='page__section'>
          {record.data && canUpdateWorkflow
            ? <button
            className='button button--small button--green button--add-small form-group__element--right new-request-button'
            onClick={() => this.setState({ showConfirmPopup: true })}
            aria-label="Edit your workflow"
          >
            Edit
          </button>
          : null}
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>Workflow Overview</h2>
          </div>
        </section>
        <div className='page__component'>
      </div>
        <section className='page__section'>
          {record.inflight
            ? <Loading />
            : record.error
              ? <ErrorReport report={record.error} />
              : record.data
                ? <div>
                  <div className='tab--wrapper'>
                    <button className={'button--tab ' + (this.state.view === 'graph' ? 'button--active' : '')}
                      onClick={() => this.state.view !== 'graph' && this.setState({ view: 'graph' })}>Graphical View</button>
                    <button className={'button--tab ' + (this.state.view === 'json' ? 'button--active' : '')}
                      onClick={() => this.state.view !== 'json' && this.setState({ view: 'json' })}>JSON View</button>
                  </div>
                  <div>
                    {this.state.view === 'graph' ? this.showGraph(record.data) : this.renderJson(record.data)}
                  </div>
                </div>
                : null}
        </section>
        {record.data
          ? <section className='page__section' id='graph'>
            <ReactFlow
              nodes={this.state.nodes}
              edges={this.state.edges}
              onInit={onLoad}
              onConnect={this.onConnect}
              zoomOnScroll={false}
              panOnScroll={false}
              style={reactFlowStyle}
            >
            </ReactFlow>
          </section>
          : null}
          <Modal show={this.state.showConfirmPopup} onHide={() => this.setState({ showConfirmPopup: false })} className='custom-modal'>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Edit Workflow</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {this.state.workflowRequestCount > 0
                ? <>There are currently <strong>{this.state.workflowRequestCount}</strong> requests using the workflow <strong>{this.props.workflows?.detail?.data?.long_name || 'No Name Available'}</strong> and will be affected by this update. Do you wish to continue?
                </>
                : <>Are you sure you want to edit <strong>{this.props.workflows?.detail?.data?.long_name || 'this workflow'}</strong>?</>
              }
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => this.setState({ showConfirmPopup: false })}>Cancel</Button>
              <Button variant="primary" onClick={() => {
                this.setState({ showConfirmPopup: false });
                this.props.history.push(`/workflows/edit/${this.props.match.params.workflowId}`);
              }}>Yes</Button>
            </Modal.Footer>
          </Modal>
      </div>
    );
  }

  hideGraph () {
    if (document.getElementById('graph') !== null) {
      document.getElementById('graph').setAttribute('class', 'hidden');
    }
  }

  renderJson (data) {
    this.hideGraph();
    return (
      <ul>
        <li>
          <label>{data.long_name}
          {this.renderReadOnlyJson('recipe', data)}</label>
        </li>
      </ul>
    );
  }
}

Workflows.propTypes = {
  match: PropTypes.object,
  workflows: PropTypes.object,
  privileges: PropTypes.object,
  dispatch: PropTypes.func,
  requests: PropTypes.object
};

export default withRouter(connect(state => ({
  privileges: state.api.tokens.privileges,
  workflows: state.workflows,
  requests: state.requests
}))(Workflows));
