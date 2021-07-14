'use strict';
import React from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import PropTypes from 'prop-types';
import ModulesMenu from './menu';
import Module from './module';

class Modules extends React.Component {
  render () {
    return (
      <div className='page__modules'>
        <div className='content__header'>
          <div className='row'>
            <h1 className='heading--xlarge'>Modules</h1>
          </div>
        </div>
        <div className='page__content'>
          <div className='wrapper__sidebar'>
            <Sidebar
              currentPath={this.props.location.pathname}
              params={this.props.params}
            />
            <Switch>
              <Route exact path='/modules' component={ModulesMenu} />
              <Route path='/modules/:moduleName' component={Module} />
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}

Modules.propTypes = {
  children: PropTypes.object,
  location: PropTypes.object,
  params: PropTypes.object
};

export default withRouter(Modules);
