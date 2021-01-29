'use strict';
import React from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import PropTypes from 'prop-types';
import RolesOverview from './overview';
import Role from './role';

class Roles extends React.Component {
  render () {
    return (
      <div className='page__roles'>
        <div className='content__header'>
          <div className='row'>
            <h1 className='heading--xlarge'>Roles</h1>
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
                <Route exact path='/roles' component={RolesOverview} />
                <Route path='/roles/id/:roleName' component={Role} />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Roles.propTypes = {
  children: PropTypes.object,
  location: PropTypes.object,
  params: PropTypes.object
};

export default withRouter(Roles);
