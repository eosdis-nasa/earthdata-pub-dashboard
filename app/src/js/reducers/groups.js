'use strict';

import { get, set, del } from 'object-path';
import assignDate from './assign-date';
import {
  GROUP,
  GROUP_INFLIGHT,
  GROUP_ERROR,

  NEW_GROUP,
  NEW_GROUP_INFLIGHT,
  NEW_GROUP_ERROR,

  UPDATE_GROUP,
  UPDATE_GROUP_INFLIGHT,
  UPDATE_GROUP_ERROR,
  UPDATE_GROUP_CLEAR,

  GROUPS,
  GROUPS_INFLIGHT,
  GROUPS_ERROR
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
  stopped: {}
};

export default createReducer(initialState, {

  [GROUP]: (state, action) => {
    const { data, id } = action;
    set(state, ['map', id, 'inflight'], false);
    set(state, ['map', id, 'data'], data);
    set(state, ['map', id, 'error'], null);
    if (get(state, ['deleted', id, 'status']) !== 'error') {
      del(state, ['deleted', id]);
    }
  },
  [GROUP_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['map', id, 'inflight'], true);
  },
  [GROUP_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['map', id, 'inflight'], false);
    set(state, ['map', id, 'error'], action.error);
  },

  [NEW_GROUP]: (state, action) => {
    const { id } = action;
    set(state, ['created', id, 'status'], 'success');
  },
  [NEW_GROUP_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['created', id, 'status'], 'inflight');
  },
  [NEW_GROUP_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['created', id, 'status'], 'error');
    set(state, ['created', id, 'error'], action.error);
  },

  [UPDATE_GROUP]: (state, action) => {
    const { data, id } = action;
    set(state, ['map', id, 'data'], data);
    set(state, ['updated', id, 'status'], 'success');
  },
  [UPDATE_GROUP_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['updated', id, 'status'], 'inflight');
  },
  [UPDATE_GROUP_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['updated', id, 'status'], 'error');
    set(state, ['updated', id, 'error'], action.error);
  },
  [UPDATE_GROUP_CLEAR]: (state, action) => {
    const { id } = action;
    del(state, ['updated', id]);
  },

  [GROUPS]: (state, action) => {
    const { data } = action;
    set(state, ['list', 'data'], data);
    set(state, ['list', 'meta'], assignDate(data.meta));
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], false);
  },
  [GROUPS_INFLIGHT]: (state, action) => {
    set(state, ['list', 'inflight'], true);
  },
  [GROUPS_ERROR]: (state, action) => {
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], action.error);
  }

});
