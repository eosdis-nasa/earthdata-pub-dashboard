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

  REQUEST_APPLYWORKFLOW,
  REQUEST_APPLYWORKFLOW_INFLIGHT,
  REQUEST_APPLYWORKFLOW_ERROR,

  REQUEST_DELETE,
  REQUEST_DELETE_INFLIGHT,
  REQUEST_DELETE_ERROR
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
  }
});
