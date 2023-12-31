import { createBrowserHistory } from 'history';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { routerMiddleware } from 'connected-react-router';
import { createRootReducer } from '../reducers';
import { requestMiddleware } from '../middleware/request';
import { createLogger } from 'redux-logger';
import { window } from '../utils/browser';
import config from '../config';

export const history = createBrowserHistory({ basename: config.basepath });

// redirect to login when not auth'd
export const requireAuth = (store) => (nextState, replace) => {
  if (!store.getState().api.authenticated) {
    replace('/auth');
  }
};

// redirect to homepage from login if authed
export const checkAuth = (store) => (nextState, replace) => {
  if (store.getState().api.authenticated) {
    replace('/');
  }
};

const isDevelopment = config.environment === 'development';

const middlewares = [
  routerMiddleware(history), // for dispatching history actions
  requestMiddleware,
  ...getDefaultMiddleware()
];

if (isDevelopment) {
  const logger = createLogger({
    collapsed: true
  });

  middlewares.push(logger);
}

// create the store and build redux middleware
export default function ourConfigureStore (preloadedState) {
  const store = configureStore({
    reducer: createRootReducer(history), // root reducer with router state
    middleware: middlewares,
    preloadedState
  });

  if (window.Cypress && window.Cypress.env('TESTING') === true) {
    window.appStore = store;
  }

  return store;
}
