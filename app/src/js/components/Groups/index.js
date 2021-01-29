'use strict';
import React from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import PropTypes from 'prop-types';
// import AddGroup from './add'; will add these pieceds back after testing
// import EditGroup from './edit';
import GroupsOverview from './overview';
import GroupOverview from './group';

class Groups extends React.Component {
  constructor () {
    super();
    this.displayName = 'Groups';
  }

  render () {
    const { pathname } = this.props.location;
    const showSidebar = pathname !== '/groups/add';
    return (
      <div className='page__groups'>
        <div className='content__header'>
          <div className='row'>
            <h1 className='heading--xlarge heading--shared-content'>Groups</h1>
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
                <Route exact path='/groups' component={GroupsOverview} />
                {/* <Route path='/groups/add' component={AddGroup} />-->
                <Route path='/groups/edit/:groupId' component={EditGroup} /> */}
                <Route path='/groups/id/:groupId' component={GroupOverview} />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Groups.propTypes = {
  children: PropTypes.object,
  location: PropTypes.object,
  params: PropTypes.object
};

export default withRouter(Groups);
