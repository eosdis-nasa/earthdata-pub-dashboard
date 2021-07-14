'use strict';
import { set } from 'object-path';
import {
  GET_MODULE_UI,
  GET_MODULE_UI_INFLIGHT,
  GET_MODULE_UI_ERROR,
  LIST_MODULES,
  LIST_MODULES_INFLIGHT,
  LIST_MODULES_ERROR
} from '../actions/types';
import { createReducer } from '@reduxjs/toolkit';

export const initialState = (() => {
  return {
    module: {
      src: "",
      inflight: false,
      error: null
    },
    list: {
      data: [],
      mapped: {},
      inflight: false,
      error: null
    }
  };
})();

export default createReducer(initialState, {
  [GET_MODULE_UI]: (state, action) => {
    set(state, 'module.src', action.data);
    set(state, 'module.inflight', false);
  },
  [GET_MODULE_UI_INFLIGHT]: (state) => {
    set(state, 'module.inflight', true);
  },
  [GET_MODULE_UI_ERROR]: (state, action) => {
    set(state, 'module.error', action.error);
    set(state, 'module.inflight', false);
  },
  [LIST_MODULES]: (state, action) => {
    const mapped = action.data.reduce((ac, mod) => {
      Object.assign(ac, { [mod.short_name]: mod });
      return ac;
    }, {});
    set(state, 'list.data', action.data);
    set(state, 'list.mapped', mapped);
    set(state, 'list.inflight', false);
  },
  [LIST_MODULES_INFLIGHT]: (state) => {
    set(state, 'list.inflight', true);
  },
  [LIST_MODULES_ERROR]: (state, action) => {
    set(state, 'list.error', action.error);
    set(state, 'list.inflight', false);
  }
});
