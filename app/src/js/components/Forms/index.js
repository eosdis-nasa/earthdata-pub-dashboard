'use strict';
import React from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import PropTypes from 'prop-types';
import AddForm from './add';
import EditForm from './edit';
import FormsOverview from './overview';
import FormOverview from './form';

class Forms extends React.Component {
  constructor () {
    super();
    this.displayName = 'Forms';
  }

  render () {
    const { pathname } = this.props.location;
    const showSidebar = pathname !== '/forms/add';
    return (
      <div className='page__forms'>
        <div className='content__header'>
          <div className='row'>
            <h1 className='heading--xlarge heading--shared-content'>Forms</h1>
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
                <Route exact path='/forms' component={FormsOverview} />
                <Route path='/forms/add' component={AddForm} />
                <Route path='/forms/edit/:formId' component={EditForm} />
                <Route path='/forms/form/:formId' component={FormOverview} />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Forms.propTypes = {
  children: PropTypes.object,
  location: PropTypes.object,
  params: PropTypes.object
};

export default withRouter(Forms);
