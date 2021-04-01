'use strict';
import { set } from 'object-path';
import assignDate from './assign-date';
import {
  ROLE,
  ROLE_INFLIGHT,
  ROLE_ERROR,
  ROLES,
  ROLES_INFLIGHT,
  ROLES_ERROR
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
  [ROLE]: (state, action) => {
    const { data } = action;
    set(state, ['detail', 'inflight'], false);
    set(state, ['detail', 'data'], assignDate(data));
  },
  [ROLE_INFLIGHT]: (state, action) => {
    set(state, ['detail', 'inflight'], true);
  },
  [ROLE_ERROR]: (state, action) => {
    set(state, ['detail', 'inflight'], false);
    set(state, ['detail', 'error'], action.error);
  },
  [ROLES]: (state, action) => {
    const { data } = action;
    set(state, ['list', 'data'], data);
    set(state, ['list', 'meta'], { queriedAt: Date.now() });
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], false);
  },
  [ROLES_INFLIGHT]: (state) => {
    set(state, ['list', 'inflight'], true);
  },
  [ROLES_ERROR]: (state, action) => {
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], action.error);
  }
});
