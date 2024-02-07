'use strict';
import React from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import PropTypes from 'prop-types';
// import AddDaac from './add'; will add these pieceds back after testing
// import EditDaac from './edit';
import DaacsOverview from './overview';
import DaacOverview from './daac';

class Daacs extends React.Component {
  constructor () {
    super();
    this.displayName = 'Daacs';
  }

  render () {
    const { pathname } = this.props.location;
    const showSidebar = pathname !== '/daacs/add';
    return (
      <div className='page__daacs'>
        <div className='content__header'>
          <div className='row'>
            <h1 className='heading--xlarge heading--shared-content'>Daacs</h1>
          </div>
        </div>
        <div className='page__content'>
          <div className='wrapper__sidebar'>
            {showSidebar
              ? <Sidebar
              currentPath={this.props.location.pathname}
              params={this.props.params}
            />
              : null}
            <div className={showSidebar ? 'page__content--shortened' : 'page__content'}>
              <Switch>
                <Route exact path='/daacs' component={DaacsOverview} />
                {/* <Route path='/daacs/add' component={AddDaac} />-->
                <Route path='/daacs/edit/:daacId' component={EditDaac} /> */}
                <Route path='/daacs/id/:daacId' component={DaacOverview} />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Daacs.propTypes = {
  children: PropTypes.object,
  location: PropTypes.object,
  params: PropTypes.object
};

export default withRouter(Daacs);
