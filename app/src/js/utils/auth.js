'use strict';
import { window } from './browser';

export const saveToken = function ({ token, user }) {
  if (window.localStorage && typeof window.localStorage.setItem === 'function' && token !== undefined && token !== null && token !== 'undefined') {
    window.localStorage.setItem('auth-token', token);
    window.localStorage.setItem('auth-user', JSON.stringify({...user, ...{authenticated: true}}));
  }
};
export const loadToken = function () {
  if (window.localStorage && typeof window.localStorage.getItem === 'function') {
    const token = window.localStorage.getItem('auth-token') || null;
    const user = JSON.parse(window.localStorage.getItem('auth-user') || '{}');
    return { token, user };
  }
  return { token: null, user: {} };
};
export const deleteToken = function () {
  if (window.localStorage && typeof window.localStorage.removeItem === 'function') {
    window.localStorage.removeItem('auth-token');
    window.localStorage.removeItem('auth-user');
  }
};
