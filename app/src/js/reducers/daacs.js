'use strict';

import { get, set, del } from 'object-path';
import assignDate from './assign-date';
import {
  DAAC,
  DAAC_INFLIGHT,
  DAAC_ERROR,

  NEW_DAAC,
  NEW_DAAC_INFLIGHT,
  NEW_DAAC_ERROR,

  UPDATE_DAAC,
  UPDATE_DAAC_INFLIGHT,
  UPDATE_DAAC_ERROR,
  UPDATE_DAAC_CLEAR,

  DAACS,
  DAACS_INFLIGHT,
  DAACS_ERROR,

  SEARCH_DAACS,
  CLEAR_DAACS_SEARCH,

  FILTER_DAACS,
  CLEAR_DAACS_FILTER,

  DAAC_DELETE,
  DAAC_DELETE_INFLIGHT,
  DAAC_DELETE_ERROR,

  OPTIONS_DAAC,
  OPTIONS_DAAC_INFLIGHT,
  OPTIONS_DAAC_ERROR
} from '../actions/types';
import { createReducer } from '@reduxjs/toolkit';

export const initialState = {
  list: {
    data: [],
    meta: {},
    params: {}
  },
  dropdowns: {},
  map: {},
  search: {},
  created: {},
  updated: {},
  deleted: {},
  restarted: {},
  stopped: {},
  searchString: null,
};

export default createReducer(initialState, {

  [DAAC]: (state, action) => {
    const { data, id } = action;
    set(state, ['map', id, 'inflight'], false);
    set(state, ['map', id, 'data'], data);
    set(state, ['map', id, 'error'], null);
    if (get(state, ['deleted', id, 'status']) !== 'error') {
      del(state, ['deleted', id]);
    }
  },
  [DAAC_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['map', id, 'inflight'], true);
  },
  [DAAC_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['map', id, 'inflight'], false);
    set(state, ['map', id, 'error'], action.error);
  },

  [NEW_DAAC]: (state, action) => {
    const { id } = action;
    set(state, ['created', id, 'status'], 'success');
  },
  [NEW_DAAC_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['created', id, 'status'], 'inflight');
  },
  [NEW_DAAC_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['created', id, 'status'], 'error');
    set(state, ['created', id, 'error'], action.error);
  },

  [UPDATE_DAAC]: (state, action) => {
    const { data, id } = action;
    set(state, ['map', id, 'data'], data);
    set(state, ['updated', id, 'status'], 'success');
  },
  [UPDATE_DAAC_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['updated', id, 'status'], 'inflight');
  },
  [UPDATE_DAAC_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['updated', id, 'status'], 'error');
    set(state, ['updated', id, 'error'], action.error);
  },
  [UPDATE_DAAC_CLEAR]: (state, action) => {
    const { id } = action;
    del(state, ['updated', id]);
  },

  [DAACS]: (state, action) => {
    const { data } = action;
    set(state, ['list', 'data'], data);
    set(state, ['list', 'meta'], assignDate(data.meta));
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], false);
  },
  [DAACS_INFLIGHT]: (state, action) => {
    set(state, ['list', 'inflight'], true);
  },
  [DAACS_ERROR]: (state, action) => {
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], action.error);
  },

  [SEARCH_DAACS]: (state, action) => {
    set(state, ['list', 'params', 'prefix'], action.prefix);
  },
  [CLEAR_DAACS_SEARCH]: (state, action) => {
    set(state, ['list', 'params', 'prefix'], null);
  },

  [FILTER_DAACS]: (state, action) => {
    set(state, ['list', 'params', action.param.key], action.param.value);
  },
  [CLEAR_DAACS_FILTER]: (state, action) => {
    set(state, ['list', 'params', action.paramKey], null);
  },

  [DAAC_DELETE]: (state, action) => {
    const { id } = action;
    set(state, ['deleted', id, 'status'], 'success');
    set(state, ['deleted', id, 'error'], null);
  },
  [DAAC_DELETE_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['deleted', id, 'status'], 'inflight');
  },
  [DAAC_DELETE_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['deleted', id, 'status'], 'error');
    set(state, ['deleted', id, 'error'], action.error);
  },

  [OPTIONS_DAAC]: (state, action) => {
    const { data } = action;
    // Map the list response to an object with key-value pairs like:
    // displayValue: optionElementValue
    const options = data.reduce((obj, daac) => {
      // Several `results` items can share a `daacName`, but
      // these are de-duplciated by the key-value structure
      obj[daac.long_name] = daac.long_name;
      return obj;
    }, { '': '' });
    set(state, ['dropdowns', 'daac', 'options'], options);
  },
  [OPTIONS_DAAC_INFLIGHT]: () => { },
  [OPTIONS_DAAC_ERROR]: (state, action) => {
    set(state, ['dropdowns', 'daac', 'options'], []);
    set(state, ['list', 'error'], action.error);
  }
});
