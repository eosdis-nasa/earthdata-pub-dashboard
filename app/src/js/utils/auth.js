'use strict';
import { window } from './browser';

export const saveToken = function (token) {
  if (window.localStorage && typeof window.localStorage.setItem === 'function') {
    window.localStorage.setItem('auth-token', token);
  }
};
export const loadToken = function () {
  let auth = null;
  if (window.localStorage && typeof window.localStorage.getItem === 'function') {
    auth = window.localStorage.getItem('auth-token') || null;
  }
  return auth;
};
export const deleteToken = function () {
  if (window.localStorage && typeof window.localStorage.removeItem === 'function') {
    window.localStorage.removeItem('auth-token');
  }
};
