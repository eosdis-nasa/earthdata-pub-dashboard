'use strict';
import React from 'react';
import Ace from 'react-ace';
import PropTypes from 'prop-types';
import dagre from 'dagre-d3';
import * as d3 from 'd3';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { getWorkflow } from '../../actions';
import config from '../../config';
import { window, setWindowEditorRef } from '../../utils/browser';
import Loading from '../LoadingIndicator/loading-indicator';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import ErrorReport from '../Errors/report';
import {
  workflowToGraph,
  draw
} from './graph-utils';

if (process.env.NODE_ENV !== 'test') window.d3 = d3;

class Workflows extends React.Component {
  constructor () {
    super();
    this.state = { view: 'json', g: null };
    this.renderReadOnlyJson = this.renderReadOnlyJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
    this.buildGraph = this.buildGraph.bind(this);
    this.hideGraph = this.hideGraph.bind(this);
  }

  componentDidMount () {
    const { dispatch } = this.props;
    const { workflowId } = this.props.match.params;
    dispatch(getWorkflow(workflowId));
  }

  buildGraph (data) {
    const graph = workflowToGraph(data.steps);
    const render = new dagre.render();
    const svgSelector = '.visual';
    const svg = d3.select(svgSelector);
    render(svg, draw(graph));
    const { height } = d3.select(`${svgSelector} g`).node().getBBox();
    const { width } = d3.select(`${svgSelector} g`).node().getBBox();
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    svg.attr('width', '25%');
    svg.attr('height', '25%');
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
                    {this.state.view === 'graph' ? this.buildGraph(record.data) : this.renderJson(record.data)}
                  </div>
                </div>
                : null}
        </section>
        <section className='page__section'>
          <svg className='visual'></svg>
        </section>
      </div>
    );
  }

  hideGraph () {
    const svgSelector = '.visual';
    const svg = d3.select(svgSelector);
    svg.attr('viewBox', `0 0 0 0`);
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
