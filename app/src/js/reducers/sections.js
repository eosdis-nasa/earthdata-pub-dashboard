'use strict';
import { set } from 'object-path';
import assignDate from './assign-date';

import {
  SECTION,
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
    [SECTION]: (state, action) => {
        const { data } = action;
        set(state, ['list', 'data'], data);
        set(state, ['list', 'meta'], assignDate(data.meta));
        set(state, ['list', 'inflight'], false);
    }
});


