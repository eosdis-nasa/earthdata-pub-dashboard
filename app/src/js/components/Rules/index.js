'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import EditRule from './edit';
// Removing this component will cause json view styling issues to occur in workflows and roles

class Rules extends React.Component {
  render () {
    const { pathname } = this.props.location;
    const showSidebar = pathname !== '/rules/add';
    return (
      <div className='page__rules'>
        <div className='content__header'>
          <div className='row'>
            <h1 className='heading--xlarge heading--shared-content'>Rules</h1>
          </div>
        </div>
        <div className='page__content'>
          <div className='wrapper__sidebar'>
            {showSidebar ? (
              <Sidebar
                currentPath={this.props.location.pathname}
                params={this.props.params}
              />
            ) : null}
            <div className={showSidebar ? 'page__content--shortened' : 'page__content'}>
              <Switch>
                <Route path='/rules/edit/:ruleName' component={EditRule} />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Rules.propTypes = {
  children: PropTypes.object,
  location: PropTypes.object,
  params: PropTypes.object
};

export default withRouter(Rules);
