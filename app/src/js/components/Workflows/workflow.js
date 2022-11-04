'use strict';
import React from 'react';
import Ace from 'react-ace';
import PropTypes from 'prop-types';
import ReactFlow from 'react-flow-renderer';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { getWorkflow } from '../../actions';
import config from '../../config';
import { setWindowEditorRef } from '../../utils/browser';
import Loading from '../LoadingIndicator/loading-indicator';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import ErrorReport from '../Errors/report';
import { workflowToGraph } from './graph-utils';

function onLoad (reactFlowInstance) {
  reactFlowInstance.fitView();
  // console.log('flow loaded:', reactFlowInstance);
}

class Workflows extends React.Component {
  constructor () {
    super();
    this.state = { view: 'json', nodes: [], edges: [], renderedGraph: false };
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
    }
  }

  renderReadOnlyJson (name, data) {
    return (
      <Ace
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
      const width = box.offsetWidth;
      reactFlowStyle = {
        left: `${(width - 350) / 2}px`,
        position: 'absolute',
        top: '400px'
      };
    }
    return (
      <div className='page__component'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <h1 className='heading--large heading--shared-content with-description'>
          {record.data ? record.data.long_name : '...'}
        </h1>
        <section className='page__section'>
          {record.inflight
            ? <Loading />
            : record.error
              ? <ErrorReport report={record.error} />
              : record.data
                ? <div>
                  <div className='tab--wrapper'>
                    <button className={'button--tab ' + (this.state.view === 'json' ? 'button--active' : '')}
                      onClick={() => this.state.view !== 'json' && this.setState({ view: 'json' })}>JSON View</button>
                    <button className={'button--tab ' + (this.state.view === 'graph' ? 'button--active' : '')}
                      onClick={() => this.state.view !== 'graph' && this.setState({ view: 'graph' })}>Graphical View</button>
                  </div>
                  <div>
                    {this.state.view === 'graph' ? this.showGraph(record.data) : this.renderJson(record.data)}
                  </div>
                </div>
                : null}
        </section>
        {record.data
          ? <section className='page__section' id='graph' style={{ height: '150vh' }}>
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
  dispatch: PropTypes.func
};

export default withRouter(connect(state => ({
  workflows: state.workflows
}))(Workflows));
