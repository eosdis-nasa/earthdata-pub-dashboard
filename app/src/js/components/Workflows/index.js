'use strict';
import React from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import PropTypes from 'prop-types';
import WorkflowsOverview from './overview';
import Workflow from './workflow';
import EditWorkflow from './edit';

const Workflows = ({ location, params }) => {
  return (
    <div className='page__workflows'>
      <div className='content__header'>
        <div className='row'>
          <h1 className='heading--xlarge'>Workflows</h1>
        </div>
      </div>
      <div className='page__content'>
        <div className='wrapper__sidebar'>
          <Sidebar
            currentPath={location.pathname}
            params={params}
          />
          <div className='page__content--shortened'>
            <Switch>
              <Route exact path='/workflows' component={WorkflowsOverview} />
              <Route path='/workflows/id/:workflowId' component={Workflow} />
              <Route path='/workflows/edit/:workflowId' component={EditWorkflow} />
              <Route path='/workflows/add' component={EditWorkflow} />
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
};

Workflows.propTypes = {
  children: PropTypes.object,
  location: PropTypes.object,
  params: PropTypes.object
};

export default withRouter(Workflows);
