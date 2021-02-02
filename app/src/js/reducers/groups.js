'use strict';

import { get, set, del } from 'object-path';
import assignDate from './assign-date';
import {
  GROUP,
  GROUP_INFLIGHT,
  GROUP_ERROR,

  NEW_GROUP,
  NEW_GROUP_INFLIGHT,
  NEW_GROUP_ERROR,

  GROUP_COLLECTIONS,
  GROUP_COLLECTIONS_INFLIGHT,
  GROUP_COLLECTIONS_ERROR,

  UPDATE_GROUP,
  UPDATE_GROUP_INFLIGHT,
  UPDATE_GROUP_ERROR,
  UPDATE_GROUP_CLEAR,

  GROUPS,
  GROUPS_INFLIGHT,
  GROUPS_ERROR,

  SEARCH_GROUPS,
  CLEAR_GROUPS_SEARCH,

  FILTER_GROUPS,
  CLEAR_GROUPS_FILTER,

  GROUP_DELETE,
  GROUP_DELETE_INFLIGHT,
  GROUP_DELETE_ERROR,

  OPTIONS_GROUPGROUP,
  OPTIONS_GROUPGROUP_INFLIGHT,
  OPTIONS_GROUPGROUP_ERROR
} from '../actions/types';
import { createReducer } from '@reduxjs/toolkit';

export const initialState = {
  list: {
    data: [],
    meta: {},
    params: {}
  },
  dropdowns: {},
  map: {},
  search: {},
  collections: {},
  created: {},
  updated: {},
  deleted: {},
  restarted: {},
  stopped: {}
};

export default createReducer(initialState, {

  [GROUP]: (state, action) => {
    const { data, id } = action;
    set(state, ['map', id, 'inflight'], false);
    set(state, ['map', id, 'data'], data);
    set(state, ['map', id, 'error'], null);
    if (get(state, ['deleted', id, 'status']) !== 'error') {
      del(state, ['deleted', id]);
    }
  },
  [GROUP_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['map', id, 'inflight'], true);
  },
  [GROUP_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['map', id, 'inflight'], false);
    set(state, ['map', id, 'error'], action.error);
  },

  [NEW_GROUP]: (state, action) => {
    const { id } = action;
    set(state, ['created', id, 'status'], 'success');
  },
  [NEW_GROUP_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['created', id, 'status'], 'inflight');
  },
  [NEW_GROUP_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['created', id, 'status'], 'error');
    set(state, ['created', id, 'error'], action.error);
  },

  [GROUP_COLLECTIONS]: (state, action) => {
    const { data, id } = action;
    set(state, ['collections', id, 'inflight'], false);
    set(state, ['collections', id, 'data'], data.map(c => c.collectionName));
  },
  [GROUP_COLLECTIONS_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['collections', id, 'inflight'], true);
  },
  [GROUP_COLLECTIONS_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['collections', id, 'inflight'], false);
    set(state, ['collections', id, 'error'], action.error);
  },

  [UPDATE_GROUP]: (state, action) => {
    const { data, id } = action;
    set(state, ['map', id, 'data'], data);
    set(state, ['updated', id, 'status'], 'success');
  },
  [UPDATE_GROUP_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['updated', id, 'status'], 'inflight');
  },
  [UPDATE_GROUP_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['updated', id, 'status'], 'error');
    set(state, ['updated', id, 'error'], action.error);
  },
  [UPDATE_GROUP_CLEAR]: (state, action) => {
    const { id } = action;
    del(state, ['updated', id]);
  },

  [GROUPS]: (state, action) => {
    const { data } = action;
    set(state, ['list', 'data'], data);
    set(state, ['list', 'meta'], assignDate(data.meta));
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], false);
  },
  [GROUPS_INFLIGHT]: (state, action) => {
    set(state, ['list', 'inflight'], true);
  },
  [GROUPS_ERROR]: (state, action) => {
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], action.error);
  },

  [SEARCH_GROUPS]: (state, action) => {
    set(state, ['list', 'params', 'prefix'], action.prefix);
  },
  [CLEAR_GROUPS_SEARCH]: (state, action) => {
    set(state, ['list', 'params', 'prefix'], null);
  },

  [FILTER_GROUPS]: (state, action) => {
    set(state, ['list', 'params', action.param.key], action.param.value);
  },
  [CLEAR_GROUPS_FILTER]: (state, action) => {
    set(state, ['list', 'params', action.paramKey], null);
  },

  [GROUP_DELETE]: (state, action) => {
    const { id } = action;
    set(state, ['deleted', id, 'status'], 'success');
    set(state, ['deleted', id, 'error'], null);
  },
  [GROUP_DELETE_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['deleted', id, 'status'], 'inflight');
  },
  [GROUP_DELETE_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['deleted', id, 'status'], 'error');
    set(state, ['deleted', id, 'error'], action.error);
  },

  [OPTIONS_GROUPGROUP]: (state, action) => {
    const { data } = action;
    // Map the list response to an object with key-value pairs like:
    // displayValue: optionElementValue
    const options = data.reduce((obj, group) => {
      // Several `results` items can share a `groupName`, but
      // these are de-duplciated by the key-value structure
      obj[group.long_name] = group.long_name;
      return obj;
    }, { '': '' });
    set(state, ['dropdowns', 'group', 'options'], options);
  },
  [OPTIONS_GROUPGROUP_INFLIGHT]: () => { },
  [OPTIONS_GROUPGROUP_ERROR]: (state, action) => {
    set(state, ['dropdowns', 'group', 'options'], []);
    set(state, ['list', 'error'], action.error);
  }
});
