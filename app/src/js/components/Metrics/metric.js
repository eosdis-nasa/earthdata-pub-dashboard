'use strict';
import React from 'react';
import AceEditor from 'react-ace';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
// import { listMetrics } from '../../actions';
import config from '../../config';
import { setWindowEditorRef } from '../../utils/browser';
import Loading from '../LoadingIndicator/loading-indicator';

class Metric extends React.Component {
  constructor () {
    super();
    this.state = { view: 'json' };
    this.get = this.get.bind(this);
    this.renderReadOnlyJson = this.renderReadOnlyJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
  }

  componentDidUpdate (prevProps) {
    const { metricName } = this.props.match.params;
    if (metricName !== prevProps.match.params.metricName) {
      this.get();
    }
  }

  componentDidMount () {
    this.get();
  }

  get (metricName) {
    // this.props.dispatch(listMetrics());
  }

  renderReadOnlyJson (name, data) {
    return (
      <AceEditor
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
    const { metrics, match: { params: { metricName } } } = this.props;
    const data = metrics.map[metricName];
    if (!data) {
      return <Loading />;
    }
    return (
      <div className='page__component'>
        <section className='page__section page__section__header-wrapper'>
          <h1 className='heading--large heading--shared-content with-description'>{metricName}</h1>
        </section>
        <section className='page__section'>
          <div className='tab--wrapper'>
            <button className={'button--tab ' + (this.state.view === 'json' ? 'button--active' : '')}
              onClick={() => this.state.view !== 'json' && this.setState({ view: 'json' })}>JSON View</button>
          </div>
          <div>
            {this.state.view === 'list' ? this.renderList(data) : this.renderJson(data)}
          </div>
        </section>
      </div>
    );
  }

  renderJson (data) {
    return (
      <ul>
        <li>
          <label>{data.name}
          {this.renderReadOnlyJson('recipe', data)}</label>
        </li>
      </ul>
    );
  }
}

Metric.propTypes = {
  match: PropTypes.object,
  metrics: PropTypes.object,
  dispatch: PropTypes.func
};

export default withRouter(connect(state => ({
  metrics: state.metrics
}))(Metric));
