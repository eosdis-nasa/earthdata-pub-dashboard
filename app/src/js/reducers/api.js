'use strict';
import * as jwt from 'jsonwebtoken';
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

function getExpiration(token) {
  const decoded = jwt.decode(token);
  if (decoded && decoded.exp) {
    return decoded.exp;
  }
  return 0;
}

export const initialState = (() => {
  const token = loadToken();
  const expiration = token ? getExpiration(token) : 0;
  const expired = expiration < Date.now();
  return {
    authenticated: !expired && token,
    inflight: false,
    error: null,
    tokens: {
      error: null,
      inflight: false,
      token: token,
      expiration: expiration
    }
  };
})();

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
    set(state, 'tokens.expiration', getExpiration(action.data.token));
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
