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

function reducePrivileges(user) {
  const privileges = user.user_privileges.reduce((acc, privilege) => {
    const [entity, action] = privilege.split('_');
    if (!acc[entity]) {
      acc[entity] = [action || '-'];
    }
    else {
      acc[entity].push(action);
    }
    return acc;
  }, {});
  return privileges;
}

export const initialState = (() => {
  const { token, user } = loadToken();
  const expiration = token ? getExpiration(token) : 0;
  const currentTime = Math.floor(Date.now() / 1000);
  const expired = expiration < currentTime;
  return {
    authenticated: !expired && token,
    inflight: false,
    error: null,
    tokens: {
      error: null,
      inflight: false,
      token: token,
      expiration: expiration,
      userName: !expired ? user.name : '',
      roles: !expired ? user.user_roles : [],
      groups: !expired ? user.user_groups : [],
      privileges: !expired ? reducePrivileges(user) : {}
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
    const { token, user } = action.data;
    saveToken({ token, user });
    set(state, 'authenticated', true);
    set(state, 'inflight', false);
    set(state, 'tokens.token', action.data.token);
    set(state, 'tokens.userName', user.name);
    set(state, 'tokens.roles', user.user_roles);
    set(state, 'tokens.groups', user.user_groups);
    set(state, 'tokens.privileges', reducePrivileges(user));
    set(state, 'tokens.expiration', getExpiration(action.data.token));
    set(state, 'tokens.inflight', false);
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
