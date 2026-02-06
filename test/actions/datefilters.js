'use strict';

import test from 'ava';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  getStats,
  listWorkflows
} from '../../app/src/js/actions';
import { requestMiddleware } from '../../app/src/js/middleware/request';
import { initialState } from '../../app/src/js/reducers/datepicker';

const middlewares = [requestMiddleware, thunk];
const mockStore = configureMockStore(middlewares);

test('Each of these list action creators will pull data from datepicker state when calling the Earthdata Pub API.', (t) => {
  const endpoints = [
    { action: 'STATS_INFLIGHT', dispatcher: getStats }
  ];

  endpoints.forEach((e) => {
    const testState = { ...initialState };
    const endDateTime = new Date(Date.now());
    const startDateTime = new Date(endDateTime - 5 * 24 * 3600 * 1000);
    testState.startDateTime = startDateTime;
    testState.endDateTime = endDateTime;

    const store = mockStore({
      datepicker: testState
    });

    store.dispatch(e.dispatcher());
    const dispatchedAction = store.getActions()[0];
    t.is(dispatchedAction.type, e.action);
    t.true('timestamp__from' in dispatchedAction.config.qs);
    t.true('timestamp__to' in dispatchedAction.config.qs);
    store.clearActions();
  });
});

test('Each of these list action creators will not use data from datepicker state when calling the Earthdata Pub API.', (t) => {
  const endpoints = [
    { action: 'WORKFLOWS_INFLIGHT', dispatcher: listWorkflows },
  ];

  endpoints.forEach((e) => {
    const testState = { ...initialState };
    const endDateTime = new Date(Date.now());
    const startDateTime = new Date(endDateTime - 5 * 24 * 3600 * 1000);
    testState.startDateTime = startDateTime;
    testState.endDateTime = endDateTime;

    const store = mockStore({
      datepicker: testState
    });

    store.dispatch(e.dispatcher());
    const dispatchedAction = store.getActions()[0];
    t.is(dispatchedAction.type, e.action);
    if ('qs' in dispatchedAction.config) {
      t.false('timestamp__from' in dispatchedAction.config.qs);
      t.false('timestamp__to' in dispatchedAction.config.qs);
    }
    store.clearActions();
  });
});
