'use strict';
import React from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import PropTypes from 'prop-types';
import AddRole from './add';
import EditRole from './edit';
import RolesOverview from './overview';
import RoleOverview from './role';

class Roles extends React.Component {
  constructor () {
    super();
    this.displayName = 'Roles';
  }

  render () {
    const { pathname } = this.props.location;
    const showSidebar = pathname !== '/roles/add';
    return (
      <div className='page__roles'>
        <div className='content__header'>
          <div className='row'>
            <h1 className='heading--xlarge heading--shared-content'>Roles</h1>
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
                <Route exact path='/roles' component={RolesOverview} />
                <Route path='/roles/add' component={AddRole} />
                <Route path='/roles/edit/:roleId' component={EditRole} />
                <Route path='/roles/role/:roleId' component={RoleOverview} />
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
