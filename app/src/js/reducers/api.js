'use strict';
import * as jwt from 'jsonwebtoken';
import { set } from 'object-path';
import { loadToken, saveToken, deleteToken } from '../utils/auth';

import {
  DELETE_TOKEN,
  LOGIN,
  FETCH_TOKEN,
  FETCH_TOKEN_INFLIGHT,
  FETCH_TOKEN_ERROR,
  SET_TOKEN
} from '../actions/types';
import { createReducer } from '@reduxjs/toolkit';

function getExpiration (token) {
  const decoded = jwt.decode(token);
  if (decoded && decoded.exp) {
    return decoded.exp;
  }
  return 0;
}

// TODO - Consider removing this function. The main concern here is that it makes searching for privileges more difficult.
// For example, a search like 'NOTE_ADDUSER' and 'REQUEST_ADDUSER' are now both generalized as ...includes('ADDUSER')
function reducePrivileges (user) {
  const privileges = user.user_privileges.reduce((acc, privilege) => {
    // Split the privilege into entity and action by the first underscore
    // ex. REQUEST_REVIEW -> ['REQUEST', 'REVIEW']
    // ex. REQUEST_REVIEW_MANAGER -> ['REQUEST', 'REVIEW_MANAGER']
    const [entity, action] = privilege.split(/_(.+)/);

    if (!acc[entity]) {
      acc[entity] = [action || '-'];
    } else {
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
    authenticated: !expired && token && user.authenticated,
    inflight: false,
    error: null,
    tokens: {
      error: null,
      inflight: false,
      token: token,
      expiration: expiration,
      userName: !expired ? user.name : '',
      userId: !expired ? user.id : '',
      user: !expired ? user : '',
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
  [FETCH_TOKEN]: (state, action) => {
    const { token, user } = action.data;
    saveToken({ token, user: { ...user, ...{ authenticated: true } } });
    set(state, 'authenticated', true);
    set(state, 'inflight', false);
    set(state, 'tokens.token', action.data.token);
    set(state, 'tokens.userName', user.name);
    set(state, 'tokens.userId', user.id);
    set(state, 'tokens.user', user);
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
