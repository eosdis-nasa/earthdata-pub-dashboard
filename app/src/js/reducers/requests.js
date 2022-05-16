'use strict';
import { set } from 'object-path';
import assignDate from './assign-date';

import {
  REQUEST,
  REQUEST_INFLIGHT,
  REQUEST_ERROR,

  REQUESTS,
  REQUESTS_INFLIGHT,
  REQUESTS_ERROR,

  REQUEST_REPROCESS,
  REQUEST_REPROCESS_INFLIGHT,
  REQUEST_REPROCESS_ERROR,

  REQUEST_REINGEST,
  REQUEST_REINGEST_INFLIGHT,
  REQUEST_REINGEST_ERROR,

  REQUEST_APPLYWORKFLOW,
  REQUEST_APPLYWORKFLOW_INFLIGHT,
  REQUEST_APPLYWORKFLOW_ERROR,

  REQUEST_REMOVE,
  REQUEST_REMOVE_INFLIGHT,
  REQUEST_REMOVE_ERROR,

  REQUEST_DELETE,
  REQUEST_DELETE_INFLIGHT,
  REQUEST_DELETE_ERROR,

  SEARCH_REQUESTS,
  CLEAR_REQUESTS_SEARCH,

  FILTER_REQUESTS,
  CLEAR_REQUESTS_FILTER,

  OPTIONS_REQUESTNAME,
  OPTIONS_REQUESTNAME_INFLIGHT,
  OPTIONS_REQUESTNAME_ERROR
} from '../actions/types';
import { createReducer } from '@reduxjs/toolkit';

export const initialState = {
  list: {
    data: [],
    meta: {},
    params: {}
  },
  dropdowns: {},
  detail: {},
  meta: {},
  reprocessed: {},
  removed: {},
  reingested: {},
  recovered: {},
  executed: {},
  deleted: {},
  recent: {}
};

export default createReducer(initialState, {
  [REQUEST]: (state, action) => {
    const { data } = action;
    set(state, ['detail', 'inflight'], false);
    set(state, ['detail', 'data'], assignDate(data));
  },
  [REQUEST_INFLIGHT]: (state, action) => {
    set(state, ['detail', 'inflight'], true);
  },
  [REQUEST_ERROR]: (state, action) => {
    set(state, ['detail', 'inflight'], false);
    set(state, ['detail', 'error'], action.error);
  },

  [REQUESTS]: (state, action) => {
    const { data } = action;
    set(state, ['list', 'data'], data);
    set(state, ['list', 'meta'], assignDate(data.meta));
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], false);
  },
  [REQUESTS_INFLIGHT]: (state, action) => {
    set(state, ['list', 'inflight'], true);
  },
  [REQUESTS_ERROR]: (state, action) => {
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], action.error);
  },

  [REQUEST_REPROCESS]: (state, action) => {
    const { id } = action;
    set(state, ['reprocessed', id, 'status'], 'success');
    set(state, ['reprocessed', id, 'error'], null);
  },
  [REQUEST_REPROCESS_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['reprocessed', id, 'status'], 'inflight');
  },
  [REQUEST_REPROCESS_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['reprocessed', id, 'status'], 'error');
    set(state, ['reprocessed', id, 'error'], action.error);
  },

  [REQUEST_REINGEST]: (state, action) => {
    const { id } = action;
    set(state, ['reingested', id, 'status'], 'success');
    set(state, ['reingested', id, 'error'], null);
  },
  [REQUEST_REINGEST_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['reingested', id, 'status'], 'inflight');
  },
  [REQUEST_REINGEST_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['reingested', id, 'status'], 'error');
    set(state, ['reingested', id, 'error'], action.error);
  },

  [REQUEST_APPLYWORKFLOW]: (state, action) => {
    const { id } = action;
    set(state, ['executed', id, 'status'], 'success');
    set(state, ['executed', id, 'error'], null);
  },
  [REQUEST_APPLYWORKFLOW_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['executed', id, 'status'], 'inflight');
  },
  [REQUEST_APPLYWORKFLOW_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['executed', id, 'status'], 'error');
    set(state, ['executed', id, 'error'], action.error);
  },

  [REQUEST_REMOVE]: (state, action) => {
    const { id } = action;
    set(state, ['removed', id, 'status'], 'success');
    set(state, ['removed', id, 'error'], null);
  },
  [REQUEST_REMOVE_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['removed', id, 'status'], 'inflight');
  },
  [REQUEST_REMOVE_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['removed', id, 'status'], 'error');
    set(state, ['removed', id, 'error'], action.error);
  },

  [REQUEST_DELETE]: (state, action) => {
    const { id } = action;
    set(state, ['deleted', id, 'status'], 'success');
    set(state, ['deleted', id, 'error'], null);
  },
  [REQUEST_DELETE_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['deleted', id, 'status'], 'inflight');
  },
  [REQUEST_DELETE_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['deleted', id, 'status'], 'error');
    set(state, ['deleted', id, 'error'], action.error);
  },

  [SEARCH_REQUESTS]: (state, action) => {
    set(state, ['list', 'params', 'prefix'], action.prefix);
  },
  [CLEAR_REQUESTS_SEARCH]: (state, action) => {
    set(state, ['list', 'params', 'prefix'], null);
  },

  [FILTER_REQUESTS]: (state, action) => {
    set(state, ['list', 'params', action.param.key], action.param.value);
  },
  [CLEAR_REQUESTS_FILTER]: (state, action) => {
    set(state, ['list', 'params', action.paramKey], null);
  },

  [OPTIONS_REQUESTNAME]: (state, action) => {
    // const { id } = action; - here because the below fix may not be the best solution but works for now
    const { id } = action.data[0].id;
    const options = action.data.reduce(
      (obj, { name }) =>
        Object.assign(obj, {
          [`${name}`]: id
        }),
      {}
    );
    set(state, ['dropdowns', 'name', 'options'], options);
  },
  // [OPTIONS_REQUESTNAME]: (state, action) => {},
  [OPTIONS_REQUESTNAME_INFLIGHT]: () => {},
  [OPTIONS_REQUESTNAME_ERROR]: (state, action) => {
    set(state, ['dropdowns', 'name', 'options'], []);
    set(state, ['list', 'error'], action.error);
  }
});
