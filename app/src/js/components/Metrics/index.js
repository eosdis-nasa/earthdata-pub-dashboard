'use strict';
import React from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import PropTypes from 'prop-types';
import MetricsOverview from './overview';
import Metric from './metric';

class Metrics extends React.Component {
  render () {
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
                <Route exact path='/metrics' component={MetricsOverview} />
                <Route path='/metrics/:metricName' component={Metric} />
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
  params: PropTypes.object
};

export default withRouter(Metrics);
