'use strict';
import React from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import PropTypes from 'prop-types';
import MetricsOverview from './overview';
import MyMetrics from '../MyMetrics/overview';
// import Metric from './metric';
import { strings } from '../locale';
import { connect } from 'react-redux';

class Metrics extends React.Component {
  constructor () {
    super();
    this.displayName = strings.all_metrics;
  }

  render () {
    const { privileges } = this.props;
    const hasMetricsPrivs = !!privileges.METRICS || !!privileges.ADMIN;
    return (
      <div className='page__metrics'>
        <div className='content__header'>
          <div className='row'>
            <h1 className='heading--xlarge'>Metrics</h1>
          </div>
        </div>
        <div className='page__content'>
          <div className='wrapper__sidebar'>
            <Sidebar
              currentPath={this.props.location.pathname}
              params={this.props.params}
            />
            <div className='page__content--shortened'>
              <Switch>
                <Route exact path='/metrics' component={hasMetricsPrivs ? MetricsOverview : MyMetrics} />
                <Route exact path='/metrics/mymetrics' component={MyMetrics} />
                <Route path='/metrics/:metricName' component={MetricsOverview} />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Metrics.propTypes = {
  children: PropTypes.object,
  location: PropTypes.object,
  params: PropTypes.object,
  privileges: PropTypes.object
};

export default withRouter(connect(state => ({
  privileges: state.api.tokens.privileges
}))(Metrics));
