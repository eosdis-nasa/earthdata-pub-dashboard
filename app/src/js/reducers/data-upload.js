'use strict';

import { get, set, del } from 'object-path';
import {
    GET_SIGNED_PUT
} from '../actions/types';
import { createReducer } from '@reduxjs/toolkit';

export const initialState = {
  list: {
    data: [],
    meta: {},
    params: {}
  },
  detail: {
    inflight: false,
    error: false,
    data: {}
  },
  map: {},
  search: {}
};

export default createReducer(initialState, {

    [GET_SIGNED_PUT]: (state, action) => {
        const { data, id } = action;
        set(state, ['detail', 'data'], data);
        set(state, ['map', id, 'data'], data);
    }
});
