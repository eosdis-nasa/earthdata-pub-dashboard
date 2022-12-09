'use strict';

import { get, set, del } from 'object-path';
import assignDate from './assign-date';
import {
  USER,
  USER_INFLIGHT,
  USER_ERROR,

  USERS,
  USERS_INFLIGHT,
  USERS_ERROR,

  USER_ADDROLE_INFLIGHT,
  USER_REMOVEROLE_INFLIGHT,
  USER_ADDGROUP_INFLIGHT,
  USER_REMOVEGROUP_INFLIGHT,

  SEARCH_USERS,
  CLEAR_USERS_SEARCH,

  FILTER_USERS,
  CLEAR_USERS_FILTER,

  OPTIONS_USERGROUP,
  OPTIONS_USERGROUP_INFLIGHT,
  OPTIONS_USERGROUP_ERROR,
  USER_CREATE
} from '../actions/types';
import { createReducer } from '@reduxjs/toolkit';

export const initialState = {
  list: {
    data: [],
    meta: {},
    params: {}
  },
  detail: {
    inflight: false,
    error: false,
    data: {}
  },
  map: {},
  search: {}
};

export default createReducer(initialState, {

  [USER]: (state, action) => {
    const { data, id } = action;
    set(state, ['detail', 'data'], data);
    set(state, ['detail', 'inflight'], false);
    set(state, ['detail', 'meta'], assignDate(data.meta));
    set(state, ['map', id, 'inflight'], false);
    set(state, ['map', id, 'data'], data);
    set(state, ['map', id, 'error'], null);
  },
  [USER_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['detail', 'inflight'], true);
    set(state, ['map', id, 'inflight'], true);
  },
  [USER_ERROR]: (state, action) => {
    const { id, error } = action;
    set(state, ['detail', 'inflight'], false);
    set(state, ['detail', 'error'], error);
    set(state, ['map', id, 'inflight'], false);
    set(state, ['map', id, 'error'], error);
  },
  [USERS]: (state, action) => {
    const { data } = action;
    set(state, ['list', 'data'], data);
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

  [USER_ADDROLE_INFLIGHT]: (state, action) => {
    set(state, ['detail', 'inflight'], true);
  },
  [USER_REMOVEROLE_INFLIGHT]: (state, action) => {
    set(state, ['detail', 'inflight'], true);
  },
  [USER_ADDGROUP_INFLIGHT]: (state, action) => {
    set(state, ['detail', 'inflight'], true);
  },
  [USER_REMOVEGROUP_INFLIGHT]: (state, action) => {
    set(state, ['detail', 'inflight'], true);
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
  [USER_CREATE]: (state, action) => {
    const { data, id } = action;
    set(state, ['map', id, 'data'], data)
  },

  [OPTIONS_USERGROUP]: (state, action) => {
    const { data } = action;
    // Map the list response to an object with key-value pairs like:
    // displayValue: optionElementValue
    const options = data.reduce((obj, user) => {
      // Several `results` items can share a `userName`, but
      // these are de-duplciated by the key-value structure
      obj[user.name] = user.name;
      return obj;
    }, { '': '' });
    set(state, ['dropdowns', 'groups', 'options'], options);
  },
  [OPTIONS_USERGROUP_INFLIGHT]: () => { },
  [OPTIONS_USERGROUP_ERROR]: (state, action) => {
    set(state, ['dropdowns', 'group', 'options'], []);
    set(state, ['list', 'error'], action.error);
  }
});
