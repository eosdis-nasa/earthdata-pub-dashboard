'use strict';

import { get, set, del } from 'object-path';
import assignDate from './assign-date';
import {
  CONVERSATION,
  CONVERSATION_INFLIGHT,
  CONVERSATION_ERROR,

  CONVERSATIONS,
  CONVERSATIONS_INFLIGHT,
  CONVERSATIONS_ERROR,

  SEARCH_CONVERSATIONS,
  CLEAR_CONVERSATIONS_SEARCH,

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

  [CONVERSATION]: (state, action) => {
    const { data, id } = action;
    set(state, ['map', id, 'inflight'], false);
    set(state, ['map', id, 'data'], data);
    set(state, ['map', id, 'error'], null);
    if (get(state, ['deleted', id, 'status']) !== 'error') {
      del(state, ['deleted', id]);
    }
  },
  [CONVERSATION_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['map', id, 'inflight'], true);
  },
  [CONVERSATION_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['map', id, 'inflight'], false);
    set(state, ['map', id, 'error'], action.error);
  },

  [CONVERSATIONS]: (state, action) => {
    const { data } = action;
    set(state, ['list', 'data'], data);
    set(state, ['list', 'meta'], assignDate(data.meta));
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], false);
  },
  [CONVERSATIONS_INFLIGHT]: (state, action) => {
    set(state, ['list', 'inflight'], true);
  },
  [CONVERSATIONS_ERROR]: (state, action) => {
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], action.error);
  },

  [SEARCH_CONVERSATIONS]: (state, action) => {
    set(state, ['list', 'params', 'prefix'], action.prefix);
  },
  [CLEAR_CONVERSATIONS_SEARCH]: (state, action) => {
    set(state, ['list', 'params', 'prefix'], null);
  }
});
