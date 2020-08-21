'use strict';

import { get, set, del } from 'object-path';
import assignDate from './assign-date';
import {
  USER,
  USER_INFLIGHT,
  USER_ERROR,

  NEW_USER,
  NEW_USER_INFLIGHT,
  NEW_USER_ERROR,

  USER_COLLECTIONS,
  USER_COLLECTIONS_INFLIGHT,
  USER_COLLECTIONS_ERROR,

  UPDATE_USER,
  UPDATE_USER_INFLIGHT,
  UPDATE_USER_ERROR,
  UPDATE_USER_CLEAR,

  USERS,
  USERS_INFLIGHT,
  USERS_ERROR,

  SEARCH_USERS,
  CLEAR_USERS_SEARCH,

  FILTER_USERS,
  CLEAR_USERS_FILTER,

  USER_DELETE,
  USER_DELETE_INFLIGHT,
  USER_DELETE_ERROR,

  OPTIONS_USERGROUP,
  OPTIONS_USERGROUP_INFLIGHT,
  OPTIONS_USERGROUP_ERROR
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
  collections: {},
  created: {},
  updated: {},
  deleted: {},
  restarted: {},
  stopped: {}
};

export default createReducer(initialState, {

  [USER]: (state, action) => {
    const { data, id } = action;
    set(state, ['map', id, 'inflight'], false);
    set(state, ['map', id, 'data'], data);
    set(state, ['map', id, 'error'], null);
    if (get(state, ['deleted', id, 'status']) !== 'error') {
      del(state, ['deleted', id]);
    }
  },
  [USER_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['map', id, 'inflight'], true);
  },
  [USER_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['map', id, 'inflight'], false);
    set(state, ['map', id, 'error'], action.error);
  },

  [NEW_USER]: (state, action) => {
    const { id } = action;
    set(state, ['created', id, 'status'], 'success');
  },
  [NEW_USER_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['created', id, 'status'], 'inflight');
  },
  [NEW_USER_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['created', id, 'status'], 'error');
    set(state, ['created', id, 'error'], action.error);
  },

  [USER_COLLECTIONS]: (state, action) => {
    const { data, id } = action;
    set(state, ['collections', id, 'inflight'], false);
    set(state, ['collections', id, 'data'], data.results.map(c => c.collectionName));
  },
  [USER_COLLECTIONS_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['collections', id, 'inflight'], true);
  },
  [USER_COLLECTIONS_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['collections', id, 'inflight'], false);
    set(state, ['collections', id, 'error'], action.error);
  },

  [UPDATE_USER]: (state, action) => {
    const { data, id } = action;
    set(state, ['map', id, 'data'], data);
    set(state, ['updated', id, 'status'], 'success');
  },
  [UPDATE_USER_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['updated', id, 'status'], 'inflight');
  },
  [UPDATE_USER_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['updated', id, 'status'], 'error');
    set(state, ['updated', id, 'error'], action.error);
  },
  [UPDATE_USER_CLEAR]: (state, action) => {
    const { id } = action;
    del(state, ['updated', id]);
  },

  [USERS]: (state, action) => {
    const { data } = action;
    set(state, ['list', 'data'], data.results);
    set(state, ['list', 'meta'], assignDate(data.meta));
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], false);
  },
  [USERS_INFLIGHT]: (state, action) => {
    set(state, ['list', 'inflight'], true);
  },
  [USERS_ERROR]: (state, action) => {
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], action.error);
  },

  [SEARCH_USERS]: (state, action) => {
    set(state, ['list', 'params', 'prefix'], action.prefix);
  },
  [CLEAR_USERS_SEARCH]: (state, action) => {
    set(state, ['list', 'params', 'prefix'], null);
  },

  [FILTER_USERS]: (state, action) => {
    set(state, ['list', 'params', action.param.key], action.param.value);
  },
  [CLEAR_USERS_FILTER]: (state, action) => {
    set(state, ['list', 'params', action.paramKey], null);
  },

  [USER_DELETE]: (state, action) => {
    const { id } = action;
    set(state, ['deleted', id, 'status'], 'success');
    set(state, ['deleted', id, 'error'], null);
  },
  [USER_DELETE_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['deleted', id, 'status'], 'inflight');
  },
  [USER_DELETE_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['deleted', id, 'status'], 'error');
    set(state, ['deleted', id, 'error'], action.error);
  },

  [OPTIONS_USERGROUP]: (state, action) => {
    const { data } = action;
    // Map the list response to an object with key-value pairs like:
    // displayValue: optionElementValue
    const options = data.results.reduce((obj, user) => {
      // Several `results` items can share a `userName`, but
      // these are de-duplciated by the key-value structure
      obj[user.userName] = user.userName;
      return obj;
    }, { '': '' });
    set(state, ['dropdowns', 'group', 'options'], options);
  },
  [OPTIONS_USERGROUP_INFLIGHT]: () => { },
  [OPTIONS_USERGROUP_ERROR]: (state, action) => {
    set(state, ['dropdowns', 'group', 'options'], []);
    set(state, ['list', 'error'], action.error);
  }
});
