'use strict';
import { set } from 'object-path';
import assignDate from './assign-date';

import {
  MODEL,
  MODEL_INFLIGHT,
} from '../actions/types';
import { createReducer } from '@reduxjs/toolkit';

export const initialState = {
  inflight: true,
  name: 'None',
  data: {}
};

export default createReducer(initialState, {
  [MODEL]: (state, action) => {
    console.log(action);
    const { id, data } = action;
    set(state, ['name'], id);
    set(state, ['data'], assignDate(data));
    set(state, ['inflight'], false);
  },
  [MODEL_INFLIGHT]: (state, action) => {
    set(state, ['inflight'], true);
  }
});
