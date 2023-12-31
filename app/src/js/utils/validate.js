'use strict';

export const isObject = (object) =>
  !Array.isArray(object) && typeof object === 'object';

export const isText = function (string) {
  return typeof string === 'string' && string.length;
};

export const isNumber = function (string) {
  return !isNaN(string);
};

export const isArray = function (object) {
  return Array.isArray(object) && object.every(Boolean);
};

export const arrayWithLength = function (length) {
  return function (object) {
    return isArray(object) && object.length >= length;
  };
};

export const requestModel = function (obj) {
  return isText(obj.requestId);
};

export const isUndefined = function (test) {
  return typeof test === 'undefined';
};
