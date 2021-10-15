'use strict';
import React, { useEffect } from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import Sidebar from '../Sidebar/sidebar';
import PropTypes from 'prop-types';
import { listModules } from '../../actions';
import ModulesMenu from './menu';
import Module from './module';

const Modules = ({ dispatch, location, params }) => {
  useEffect(() => {
    dispatch(listModules());
  }, []);
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
            currentPath={location.pathname}
            params={params}
          />
          <Switch>
            <Route exact path='/modules' component={ModulesMenu} />
            <Route path='/modules/:moduleName' component={Module} />
          </Switch>
        </div>
      </div>
    </div>
  );
};

Modules.propTypes = {
  dispatch: PropTypes.func,
  location: PropTypes.object,
  params: PropTypes.object
};

export default withRouter(connect(
  (state) => ({ modules: state.modules })
)(Modules));
