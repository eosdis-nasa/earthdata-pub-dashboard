'use strict';

import { get, set, del } from 'object-path';
import assignDate from './assign-date';
import {
  FORM,
  FORM_INFLIGHT,
  FORM_ERROR,

  FORMS,
  FORMS_INFLIGHT,
  FORMS_ERROR
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

  [FORM]: (state, action) => {
    const { data, id } = action;
    set(state, ['map', id, 'inflight'], false);
    set(state, ['map', id, 'data'], data);
    set(state, ['map', id, 'error'], null);
    if (get(state, ['deleted', id, 'status']) !== 'error') {
      del(state, ['deleted', id]);
    }
  },
  [FORM_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['map', id, 'inflight'], true);
  },
  [FORM_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['map', id, 'inflight'], false);
    set(state, ['map', id, 'error'], action.error);
  },

  [FORMS]: (state, action) => {
    const { data } = action;
    set(state, ['list', 'data'], data);
    set(state, ['list', 'meta'], assignDate(data.meta));
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], false);
  },
  [FORMS_INFLIGHT]: (state, action) => {
    set(state, ['list', 'inflight'], true);
  },
  [FORMS_ERROR]: (state, action) => {
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], action.error);
  }
});
