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

function onLoad (reactFlowInstance) {
  reactFlowInstance.fitView();
}

class Workflows extends React.Component {
  constructor () {
    super();
    this.state = { view: 'graph', nodes: [], edges: [], renderedGraph: false };
    this.renderReadOnlyJson = this.renderReadOnlyJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
    this.showGraph = this.showGraph.bind(this);
    this.hideGraph = this.hideGraph.bind(this);
    this.onConnect = this.onConnect.bind(this);
  }

  componentDidMount () {
    const { dispatch } = this.props;
    const { workflowId } = this.props.match.params;
    dispatch(getWorkflow(workflowId));
    setTimeout(() => {
      const record = this.props.workflows.detail;
      if (typeof record.data !== 'undefined') {
        const graphData = workflowToGraph(record.data.steps);
        this.setState({ nodes: graphData[0] });
        this.setState({ edges: graphData[1] });
      }
    }, 2000);
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
      const sidebar = document.querySelector('div.sidebar').offsetWidth;
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
            ? <Link
              className='button button--small button--green button--add-small form-group__element--right new-request-button' to={{ pathname: `/workflows/edit/${record.data.id}` }} aria-label="Edit your workflow">Edit</Link>
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
  dispatch: PropTypes.func
};

export default withRouter(connect(state => ({
  privileges: state.api.tokens.privileges,
  workflows: state.workflows
}))(Workflows));
