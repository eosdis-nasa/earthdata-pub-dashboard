'use strict';
import { set } from 'object-path';
import { loadToken, saveToken, deleteToken } from '../utils/auth';

import {
  DELETE_TOKEN,
  LOGIN,
  LOGOUT,
  FETCH_TOKEN,
  FETCH_TOKEN_INFLIGHT,
  FETCH_TOKEN_ERROR,
  SET_TOKEN
} from '../actions/types';
import { createReducer } from '@reduxjs/toolkit';

export const initialState = {
  authenticated: !!loadToken(),
  inflight: false,
  error: null,
  tokens: {
    error: null,
    inflight: false,
    token: loadToken()
  }
};

export default createReducer(initialState, {
  [DELETE_TOKEN]: (state) => {
    deleteToken();
  },
  [LOGIN]: (state, action) => {
    set(state, 'inflight', false);
  },
  [LOGOUT]: (state) => {
    deleteToken();
    set(state, 'authenticated', false);
    set(state, 'inflight', false);
    set(state, 'tokens.token', null);
  },
  [FETCH_TOKEN]: (state, action) => {
    saveToken(action.data.token);
    set(state, 'authenticated', true);
    set(state, 'inflight', false);
    set(state, 'tokens.inflight', false);
    set(state, 'tokens.token', action.data.token);
  },
  [FETCH_TOKEN_INFLIGHT]: (state) => {
    set(state, 'inflight', true);
    set(state, 'tokens.inflight', true);
  },
  [FETCH_TOKEN_ERROR]: (state, action) => {
    set(state, 'tokens.error', action.error);
    set(state, 'tokens.inflight', false);
    set(state, 'inflight', false);
  },
  [SET_TOKEN]: (state, action) => {
    set(state, 'tokens.token', action.token);
  }
});
