'use strict';

import { get, set, del } from 'object-path';
import assignDate from './assign-date';
import {
  FORM,
  FORM_INFLIGHT,
  FORM_ERROR,

  NEW_FORM,
  NEW_FORM_INFLIGHT,
  NEW_FORM_ERROR,

  FORM_COLLECTIONS,
  FORM_COLLECTIONS_INFLIGHT,
  FORM_COLLECTIONS_ERROR,

  UPDATE_FORM,
  UPDATE_FORM_INFLIGHT,
  UPDATE_FORM_ERROR,
  UPDATE_FORM_CLEAR,

  FORMS,
  FORMS_INFLIGHT,
  FORMS_ERROR,

  SEARCH_FORMS,
  CLEAR_FORMS_SEARCH,

  FILTER_FORMS,
  CLEAR_FORMS_FILTER,

  FORM_DELETE,
  FORM_DELETE_INFLIGHT,
  FORM_DELETE_ERROR,

  OPTIONS_FORMGROUP,
  OPTIONS_FORMGROUP_INFLIGHT,
  OPTIONS_FORMGROUP_ERROR
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

  [FORM]: (state, action) => {
    const { data, id } = action;
    set(state, ['map', id, 'inflight'], false);
    set(state, ['map', id, 'data'], data);
    set(state, ['map', id, 'error'], null);
    if (get(state, ['deleted', id, 'status']) !== 'error') {
      del(state, ['deleted', id]);
    }
  },
  [FORM_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['map', id, 'inflight'], true);
  },
  [FORM_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['map', id, 'inflight'], false);
    set(state, ['map', id, 'error'], action.error);
  },

  [NEW_FORM]: (state, action) => {
    const { id } = action;
    set(state, ['created', id, 'status'], 'success');
  },
  [NEW_FORM_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['created', id, 'status'], 'inflight');
  },
  [NEW_FORM_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['created', id, 'status'], 'error');
    set(state, ['created', id, 'error'], action.error);
  },

  [FORM_COLLECTIONS]: (state, action) => {
    const { data, id } = action;
    set(state, ['collections', id, 'inflight'], false);
    set(state, ['collections', id, 'data'], data.map(c => c.collectionName));
  },
  [FORM_COLLECTIONS_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['collections', id, 'inflight'], true);
  },
  [FORM_COLLECTIONS_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['collections', id, 'inflight'], false);
    set(state, ['collections', id, 'error'], action.error);
  },

  [UPDATE_FORM]: (state, action) => {
    const { data, id } = action;
    set(state, ['map', id, 'data'], data);
    set(state, ['updated', id, 'status'], 'success');
  },
  [UPDATE_FORM_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['updated', id, 'status'], 'inflight');
  },
  [UPDATE_FORM_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['updated', id, 'status'], 'error');
    set(state, ['updated', id, 'error'], action.error);
  },
  [UPDATE_FORM_CLEAR]: (state, action) => {
    const { id } = action;
    del(state, ['updated', id]);
  },

  [FORMS]: (state, action) => {
    const { data } = action;
    set(state, ['list', 'data'], data);
    set(state, ['list', 'meta'], assignDate(data.meta));
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], false);
  },
  [FORMS_INFLIGHT]: (state, action) => {
    set(state, ['list', 'inflight'], true);
  },
  [FORMS_ERROR]: (state, action) => {
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], action.error);
  },

  [SEARCH_FORMS]: (state, action) => {
    set(state, ['list', 'params', 'prefix'], action.prefix);
  },
  [CLEAR_FORMS_SEARCH]: (state, action) => {
    set(state, ['list', 'params', 'prefix'], null);
  },

  [FILTER_FORMS]: (state, action) => {
    set(state, ['list', 'params', action.param.key], action.param.value);
  },
  [CLEAR_FORMS_FILTER]: (state, action) => {
    set(state, ['list', 'params', action.paramKey], null);
  },

  [FORM_DELETE]: (state, action) => {
    const { id } = action;
    set(state, ['deleted', id, 'status'], 'success');
    set(state, ['deleted', id, 'error'], null);
  },
  [FORM_DELETE_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['deleted', id, 'status'], 'inflight');
  },
  [FORM_DELETE_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['deleted', id, 'status'], 'error');
    set(state, ['deleted', id, 'error'], action.error);
  },

  [OPTIONS_FORMGROUP]: (state, action) => {
    const { data } = action;
    // Map the list response to an object with key-value pairs like:
    // displayValue: optionElementValue
    const options = data.reduce((obj, form) => {
      // Several `results` items can share a `formName`, but
      // these are de-duplciated by the key-value structure
      obj[form.long_name] = form.long_name;
      return obj;
    }, { '': '' });
    set(state, ['dropdowns', 'group', 'options'], options);
  },
  [OPTIONS_FORMGROUP_INFLIGHT]: () => { },
  [OPTIONS_FORMGROUP_ERROR]: (state, action) => {
    set(state, ['dropdowns', 'group', 'options'], []);
    set(state, ['list', 'error'], action.error);
  }
});
