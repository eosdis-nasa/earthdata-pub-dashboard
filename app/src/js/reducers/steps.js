'use strict';
import { set } from 'object-path';
import assignDate from './assign-date';

import {
  STEP,
  STEP_INFLIGHT,

  STEPS,
  STEPS_INFLIGHT,
  SEARCH_STEPS,
  CLEAR_STEPS_SEARCH,

  FILTER_STEPS,
  CLEAR_STEPS_FILTER
} from '../actions/types';
import { createReducer } from '@reduxjs/toolkit';

export const initialState = {
  list: {
    data: [],
    meta: {},
    params: {}
  },
  detail: {}
};

export default createReducer(initialState, {
  [STEP]: (state, action) => {
    const { data } = action;
    set(state, ['detail', 'inflight'], false);
    set(state, ['detail', 'data'], assignDate(data));
  },
  [STEP_INFLIGHT]: (state, action) => {
    set(state, ['detail', 'inflight'], true);
  },
  [STEPS]: (state, action) => {
    const { data } = action;
    set(state, ['list', 'data'], data);
    set(state, ['list', 'meta'], assignDate(data.meta));
    set(state, ['list', 'inflight'], false);
  },
  [STEPS_INFLIGHT]: (state, action) => {
    set(state, ['list', 'inflight'], true);
  },
  [SEARCH_STEPS]: (state, action) => {
    set(state, ['list', 'params', 'prefix'], action.prefix);
  },
  [CLEAR_STEPS_SEARCH]: (state, action) => {
    set(state, ['list', 'params', 'prefix'], null);
  },
  [FILTER_STEPS]: (state, action) => {
    set(state, ['list', 'params', action.param.key], action.param.value);
  },
  [CLEAR_STEPS_FILTER]: (state, action) => {
    set(state, ['list', 'params', action.paramKey], null);
  }
});
