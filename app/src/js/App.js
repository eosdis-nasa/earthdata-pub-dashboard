'use strict';
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import ourConfigureStore, { history } from './store/configureStore';
import { Route, Redirect, Switch } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';

//  Fontawesome Icons Library
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faSignOutAlt, faSearch, faSync, faRedo, faPlus, faInfoCircle, faTimesCircle, faSave, faCalendar, faExpand, faCompress, faClock, faCaretDown, faChevronDown, faSort, faSortDown, faSortUp, faArrowAltCircleLeft, faArrowAltCircleRight, faArrowAltCircleDown, faArrowAltCircleUp, faArrowRight, faCopy, faEdit, faArchive, faLaptopCode, faServer, faHdd, faExternalLinkSquareAlt, faToggleOn, faToggleOff, faExclamationTriangle, faCoins, faCheckCircle, faCircle } from '@fortawesome/free-solid-svg-icons';

// Authorization & Error Handling
// import ErrorBoundary from './components/Errors/ErrorBoundary';
import NotFound from './components/404';
import Auth from './components/Auth';

// Components
import Home from './components/home';
import Main from '../js/main';
import Requests from './components/Requests';
import Users from './components/Users';
import Groups from './components/Groups';
import Forms from './components/Forms';
import Questions from './components/Questions';
import Workflows from './components/Workflows';
import Metrics from './components/Metrics';
import Roles from './components/Roles';
import Conversations from './components/Conversations';
import Rules from './components/Rules';
import TestApi from './components/testApi';

import config from './config';
library.add(faSignOutAlt, faSearch, faSync, faRedo, faPlus, faInfoCircle, faTimesCircle, faSave, faCalendar, faExpand, faCompress, faClock, faCaretDown, faSort, faChevronDown, faSortDown, faSortUp, faArrowAltCircleLeft, faArrowAltCircleRight, faArrowAltCircleDown, faArrowAltCircleUp, faArrowRight, faCopy, faEdit, faArchive, faLaptopCode, faServer, faHdd, faExternalLinkSquareAlt, faToggleOn, faToggleOff, faExclamationTriangle, faCoins, faCheckCircle, faCircle);
dom.watch();

console.log.apply(console, config.consoleMessage);
console.log('Environment', config.environment);

// Wrapper for Main component to include routing
const MainRoutes = () => {
  return (
    <Main path='/'>
      <Switch>
        <Route exact path='/' component={Home} />
        <Route path='/404' component={NotFound} />
        <Route path='/requests' component={Requests} />
        <Route path='/forms' component={Forms} />
        <Route path='/questions' component={Questions} />
        <Route path='/users' component={Users} />
        <Route path='/groups' component={Groups} />
        <Route path='/workflows' component={Workflows} />
        <Route path='/metrics' component={Metrics} />
        <Route path='/roles' component={Roles} />
        <Route path='/conversations/' component={Conversations} />
        <Route path='/rules' component={Rules} />
        <Route path='/test-api' component={TestApi} />
      </Switch>
    </Main>
  );
};

// generate the root App Component
class App extends Component {
  constructor (props) {
    super(props);
    this.state = {};
    this.store = ourConfigureStore({});
    this.isLoggedIn = this.isLoggedIn.bind(this);
  }

  isLoggedIn () {
    return this.store.getState().api.authenticated;
  }

  render () {
    return (
    // <ErrorBoundary> // Add after troublshooting other errors
    // Routes
      <div className="routes">
        <Provider store={this.store}>
          <ConnectedRouter history={history}>
            <Switch>
              <Redirect exact from='/login' to='/auth' />
              <Route path='/auth' component={Auth} />
              <Route path='/' render={() => this.isLoggedIn() ? <MainRoutes /> : <Redirect to='/auth' />} />
            </Switch>
          </ConnectedRouter>
        </Provider>
      </div>
    );
  }
}

export default App;
