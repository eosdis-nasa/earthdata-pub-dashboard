'use strict';
import { set } from 'object-path';
import assignDate from './assign-date';

import {
  QUESTION,
  QUESTION_INFLIGHT,

  QUESTIONS,
  QUESTIONS_INFLIGHT
} from '../actions/types';
import { createReducer } from '@reduxjs/toolkit';

export const initialState = {
  list: {
    data: [],
    meta: {},
    params: {}
  },
  detail: {},
  dropdowns: {},
  map: {},
  meta: {},
  recent: {}
};

export default createReducer(initialState, {
  [QUESTION]: (state, action) => {
    const { data } = action;
    set(state, ['detail', 'inflight'], false);
    set(state, ['detail', 'data'], assignDate(data));
  },
  [QUESTION_INFLIGHT]: (state, action) => {
    set(state, ['detail', 'inflight'], true);
  },
  [QUESTIONS]: (state, action) => {
    const { data } = action;
    set(state, ['list', 'data'], data);
    set(state, ['list', 'meta'], assignDate(data.meta));
    set(state, ['list', 'inflight'], false);
  },
  [QUESTIONS_INFLIGHT]: (state, action) => {
    set(state, ['list', 'inflight'], true);
  }
});
