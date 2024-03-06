'use strict';
import { set } from 'object-path';
import {
  METRICS,
  METRICS_INFLIGHT,
  METRICS_ERROR,
  SEARCH_METRICS,
  CLEAR_METRICS_SEARCH
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
  [METRICS]: (state, action) => {
    const { data: rawData } = action;
    const data = filterData(rawData, state.searchString);
    set(state, 'map', data);
    
    const allData = action.config.body?.metric === 'time_to_publish' ? data : action.config.body?.metric === 'user_count'  ? [data] : data.submissions ? data.submissions : [];
    
    set(state, ['list', 'data'], allData);
    set(state, ['list', 'meta'], { queriedAt: Date.now() });
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], false);
  },
  [METRICS_INFLIGHT]: (state) => {
    set(state, ['list', 'inflight'], true);
  },
  [METRICS_ERROR]: (state, action) => {
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], action.error);
  },
  [SEARCH_METRICS]: (state, action) => {
    set(state, ['searchString'], action.searchString);
  },
  [CLEAR_METRICS_SEARCH]: (state) => {
    set(state, ['searchString'], null);
  }
});
