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

  [USER_CREATE]: (state, action) => {
    const { data, id } = action;
    set(state, ['detail', 'data'], data);
    set(state, ['map', id, 'data'], data);
  }
});
