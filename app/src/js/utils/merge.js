'use strict';

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

const isPlainObject = (value) => (
  value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
  && Object.prototype.toString.call(value) === '[object Object]'
);

/**
 * Deep-merge objects. Arrays are replaced (not concatenated), matching the
 * previous deepmerge + arrayMerge behavior used by Edit forms.
 */
const merge = (target, source) => {
  if (!isPlainObject(source)) {
    return source;
  }
  if (!isPlainObject(target)) {
    target = {};
  }

  const output = { ...target };

  Object.keys(source).forEach((key) => {
    if (DANGEROUS_KEYS.has(key)) {
      return;
    }

    const sourceValue = source[key];
    const targetValue = output[key];

    if (isPlainObject(sourceValue)) {
      // Always recurse so nested dangerous keys are stripped even when the
      // target has no object at this key yet.
      output[key] = merge(isPlainObject(targetValue) ? targetValue : {}, sourceValue);
    } else {
      // Arrays and primitives: take source (array replace, same as before)
      output[key] = sourceValue;
    }
  });

  return output;
};

export default merge;
