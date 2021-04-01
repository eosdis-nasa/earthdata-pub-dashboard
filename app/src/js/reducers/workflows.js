'use strict';
import { set } from 'object-path';
import assignDate from './assign-date';
import {
  WORKFLOW,
  WORKFLOW_INFLIGHT,
  WORKFLOW_ERROR,
  WORKFLOWS,
  WORKFLOWS_INFLIGHT,
  WORKFLOWS_ERROR
} from '../actions/types';
import { createReducer } from '@reduxjs/toolkit';

export const initialState = {
  list: {
    data: [],
    meta: {},
    inflight: false,
    error: false,
  },
  detail: {},
  searchString: null,
};

export default createReducer(initialState, {
  [WORKFLOW]: (state, action) => {
    const { data } = action;
    set(state, ['detail', 'inflight'], false);
    set(state, ['detail', 'data'], assignDate(data));
  },
  [WORKFLOW_INFLIGHT]: (state, action) => {
    set(state, ['detail', 'inflight'], true);
  },
  [WORKFLOW_ERROR]: (state, action) => {
    set(state, ['detail', 'inflight'], false);
    set(state, ['detail', 'error'], action.error);
  },
  [WORKFLOWS]: (state, action) => {
    const { data } = action;
    set(state, ['list', 'data'], data);
    set(state, ['list', 'meta'], { queriedAt: Date.now() });
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], false);
  },
  [WORKFLOWS_INFLIGHT]: (state) => {
    set(state, ['list', 'inflight'], true);
  },
  [WORKFLOWS_ERROR]: (state, action) => {
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], action.error);
  }
});
