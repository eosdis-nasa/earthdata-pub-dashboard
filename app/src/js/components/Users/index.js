'use strict';
import React from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import PropTypes from 'prop-types';
import AddUser from './add';
import EditUser from './edit';
import UsersOverview from './overview';
import UserOverview from './user';

class Users extends React.Component {
  constructor () {
    super();
    this.displayName = 'Users';
  }

  render () {
    const { pathname } = this.props.location;
    const showSidebar = pathname !== '/users/add';
    return (
      <div className='page__users'>
        <div className='content__header'>
          <div className='row'>
            <h1 className='heading--xlarge heading--shared-content'>Users</h1>
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
                <Route exact path='/users' component={UsersOverview} />
                <Route path='/users/add' component={AddUser} />
                <Route path='/users/edit/:userId' component={EditUser} />
                <Route path='/users/user/:userId' component={UserOverview} />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Users.propTypes = {
  children: PropTypes.object,
  location: PropTypes.object,
  params: PropTypes.object
};

export default withRouter(Users);
