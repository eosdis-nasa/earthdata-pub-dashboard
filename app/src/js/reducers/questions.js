'use strict';
import { set, del } from 'object-path';
import assignDate from './assign-date';

import {
  QUESTION,
  QUESTION_INFLIGHT,
  QUESTION_ERROR,

  QUESTIONS,
  QUESTIONS_INFLIGHT,
  QUESTIONS_ERROR,

  QUESTION_DELETE,
  QUESTION_DELETE_INFLIGHT,
  QUESTION_DELETE_ERROR,

  SEARCH_QUESTIONS,
  CLEAR_QUESTIONS_SEARCH,

  FILTER_QUESTIONS,
  CLEAR_QUESTIONS_FILTER
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
  meta: {},
  recent: {}
};

export default createReducer(initialState, {
  [QUESTION]: (state, action) => {
    const { id, data } = action;
    set(state, ['map', id, 'inflight'], false);
    set(state, ['map', id, 'data'], assignDate(data));
  },
  [QUESTION_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['map', id, 'inflight'], true);
  },
  [QUESTIONS]: (state, action) => {
    const { data } = action;
    set(state, ['list', 'data'], data);
    set(state, ['list', 'meta'], assignDate(data.meta));
    set(state, ['list', 'inflight'], false);
  },
  [QUESTIONS_INFLIGHT]: (state, action) => {
    set(state, ['list', 'inflight'], true);
  },
  [QUESTIONS_ERROR]: (state, action) => {
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], action.error);
  },
  [SEARCH_QUESTIONS]: (state, action) => {
    set(state, ['list', 'params', 'prefix'], action.prefix);
  },
  [CLEAR_QUESTIONS_SEARCH]: (state, action) => {
    set(state, ['list', 'params', 'prefix'], null);
  },
  [FILTER_QUESTIONS]: (state, action) => {
    set(state, ['list', 'params', action.param.key], action.param.value);
  },
  [CLEAR_QUESTIONS_FILTER]: (state, action) => {
    set(state, ['list', 'params', action.paramKey], null);
  }
});
