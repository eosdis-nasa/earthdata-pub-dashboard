'use strict';
import { set } from 'object-path';
import {
  ROLES,
  ROLES_INFLIGHT,
  ROLES_ERROR,
  SEARCH_ROLES,
  CLEAR_ROLES_SEARCH
} from '../actions/types';
import { createReducer } from '@reduxjs/toolkit';

export const initialState = {
  list: {
    data: [],
    meta: {},
    inflight: false,
    error: false,
  },
  map: {},
  searchString: null,
};

function createMap (data) {
  const map = {};
  data.forEach(d => {
    map[d.id] = d;
  });
  return map;
}

/**
 * Filters intput data by filterstring on the data'a object's name.
*
 * @param {Array} rawData - An array of objects with a name parameter.
 * @param {string} filterString - a string to check if name includes.
 * @returns {Array} Filtered Array of rawData's objects who's names include filterString.
 */
export const filterData = (rawData, filterString) => {
  if (filterString !== null) {
    return rawData.filter(d => d.name && d.name.toLowerCase().includes(filterString.toLowerCase()));
  }
  return rawData;
};

export default createReducer(initialState, {
  [ROLES]: (state, action) => {
    const { data: rawData } = action;
    const data = filterData(rawData, state.searchString);
    set(state, 'map', createMap(data));
    set(state, ['list', 'data'], data);
    set(state, ['list', 'meta'], { queriedAt: Date.now() });
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], false);
  },
  [ROLES_INFLIGHT]: (state) => {
    set(state, ['list', 'inflight'], true);
  },
  [ROLES_ERROR]: (state, action) => {
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], action.error);
  },
  [SEARCH_ROLES]: (state, action) => {
    set(state, ['searchString'], action.searchString);
  },
  [CLEAR_ROLES_SEARCH]: (state) => {
    set(state, ['searchString'], null);
  },
});
