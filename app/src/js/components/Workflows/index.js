'use strict';
import React from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import PropTypes from 'prop-types';
import WorkflowsOverview from './overview';
import WorkflowOverview from './workflow';
import { strings } from '../locale';

class Workflows extends React.Component {
  constructor () {
    super();
    this.displayName = strings.all_workflows;
  }

  render () {
    const { pathname } = this.props.location;
    const showSidebar = pathname !== '/workflows/add';
    return (
      <div className='page__workflows'>
        <div className='content__header'>
          <div className='row'>
            <h1 className='heading--xlarge heading--shared-content'>Workflows</h1>
          </div>
        </div>
        <div className='page__content'>
          <div className='wrapper__sidebar'>
            {showSidebar ? <Sidebar
              currentPath={this.props.location.pathname}
              params={this.props.params}
            /> : null}
            <div className={showSidebar ? 'page__content--shortened' : 'page__content'}>
              <Switch>
                <Route exact path='/workflows' component={WorkflowsOverview} />
                <Route path='/workflows/id/:workflowId' component={WorkflowOverview} />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Workflows.propTypes = {
  children: PropTypes.object,
  location: PropTypes.object,
  params: PropTypes.object
};

export default withRouter(Workflows);
