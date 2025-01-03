'use strict';
import React from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import PropTypes from 'prop-types';
import FormsOverview from './overview';
import FormOverview from './form';
import { strings } from '../locale';

class FormRequest extends React.Component {
  constructor () {
    super();
    this.displayName = 'DAAC Assignment';
  }

  render () {
    const { pathname } = this.props.location;
    const showSidebar = pathname !== '/forms/add';
    return (
      <div className='page__forms'>
        <div className='content__header'>
          <div className='row'>
            <h1 className='heading--xlarge heading--shared-content'>DAAC Assignment</h1>
          </div>
        </div>
        <div className='page__content'>
          <div className='wrapper__sidebar'>
            <div className={showSidebar ? 'page__content--shortened' : 'page__content'}>
              <Switch>
                <Route exact path='/daac/assignment' component={FormsOverview} />
                <Route exact path='/daac/assignment/:requestId' component={FormsOverview} />
                {/* <Route path='/daac/selection/id/:formId' component={FormOverview} /> */}
                <Route path='/questions/:id' component={FormsOverview} />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

FormRequest.propTypes = {
  children: PropTypes.object,
  location: PropTypes.object,
  params: PropTypes.object
};

export default withRouter(FormRequest);
