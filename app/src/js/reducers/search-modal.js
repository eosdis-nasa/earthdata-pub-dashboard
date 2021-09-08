'use strict';
import { set } from 'object-path';

import {
  SEARCH_MODAL,
  SEARCH_MODAL_INFLIGHT,
} from '../actions/types';
import { createReducer } from '@reduxjs/toolkit';

export const initialState = {
  inflight: false,
  list: []
};

export default createReducer(initialState, {
  [SEARCH_MODAL]: (state, action) => {
    const { data } = action;
    set(state, ['list'], data);
    set(state, ['inflight'], false);
  },
  [SEARCH_MODAL_INFLIGHT]: (state, action) => {
    set(state, ['inflight'], true);
  }
});
