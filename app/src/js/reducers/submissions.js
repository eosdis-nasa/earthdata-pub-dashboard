'use strict';
import { set, del } from 'object-path';
import assignDate from './assign-date';
import removeDeleted from './remove-deleted';

import {
  SUBMISSION,
  SUBMISSION_INFLIGHT,
  SUBMISSION_ERROR,

  SUBMISSIONS,
  SUBMISSIONS_INFLIGHT,
  SUBMISSIONS_ERROR,

  SUBMISSION_REPROCESS,
  SUBMISSION_REPROCESS_INFLIGHT,
  SUBMISSION_REPROCESS_ERROR,

  SUBMISSION_REINGEST,
  SUBMISSION_REINGEST_INFLIGHT,
  SUBMISSION_REINGEST_ERROR,

  SUBMISSION_APPLYWORKFLOW,
  SUBMISSION_APPLYWORKFLOW_INFLIGHT,
  SUBMISSION_APPLYWORKFLOW_ERROR,

  SUBMISSION_REMOVE,
  SUBMISSION_REMOVE_INFLIGHT,
  SUBMISSION_REMOVE_ERROR,

  SUBMISSION_DELETE,
  SUBMISSION_DELETE_INFLIGHT,
  SUBMISSION_DELETE_ERROR,

  SEARCH_SUBMISSIONS,
  CLEAR_SUBMISSIONS_SEARCH,

  FILTER_SUBMISSIONS,
  CLEAR_SUBMISSIONS_FILTER,

  OPTIONS_SUBMISSIONNAME,
  OPTIONS_SUBMISSIONNAME_INFLIGHT,
  OPTIONS_SUBMISSIONNAME_ERROR
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
  meta: {},
  reprocessed: {},
  removed: {},
  reingested: {},
  recovered: {},
  executed: {},
  deleted: {},
  recent: {}
};

export default createReducer(initialState, {
  [SUBMISSION]: (state, action) => {
    const { id, data } = action;
    set(state, ['map', id, 'inflight'], false);
    set(state, ['map', id, 'data'], assignDate(data));
    del(state, ['deleted', id]);
  },
  [SUBMISSION_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['map', id, 'inflight'], true);
  },
  [SUBMISSION_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['map', id, 'inflight'], false);
    set(state, ['map', id, 'error'], action.error);
  },

  [SUBMISSIONS]: (state, action) => {
    const { data } = action;
    set(state, ['list', 'data'], removeDeleted('submissionId', data.results, state.deleted));
    set(state, ['list', 'meta'], assignDate(data.meta));
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], false);
  },
  [SUBMISSIONS_INFLIGHT]: (state, action) => {
    set(state, ['list', 'inflight'], true);
  },
  [SUBMISSIONS_ERROR]: (state, action) => {
    set(state, ['list', 'inflight'], false);
    set(state, ['list', 'error'], action.error);
  },

  [SUBMISSION_REPROCESS]: (state, action) => {
    const { id } = action;
    set(state, ['reprocessed', id, 'status'], 'success');
    set(state, ['reprocessed', id, 'error'], null);
  },
  [SUBMISSION_REPROCESS_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['reprocessed', id, 'status'], 'inflight');
  },
  [SUBMISSION_REPROCESS_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['reprocessed', id, 'status'], 'error');
    set(state, ['reprocessed', id, 'error'], action.error);
  },

  [SUBMISSION_REINGEST]: (state, action) => {
    const { id } = action;
    set(state, ['reingested', id, 'status'], 'success');
    set(state, ['reingested', id, 'error'], null);
  },
  [SUBMISSION_REINGEST_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['reingested', id, 'status'], 'inflight');
  },
  [SUBMISSION_REINGEST_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['reingested', id, 'status'], 'error');
    set(state, ['reingested', id, 'error'], action.error);
  },

  [SUBMISSION_APPLYWORKFLOW]: (state, action) => {
    const { id } = action;
    set(state, ['executed', id, 'status'], 'success');
    set(state, ['executed', id, 'error'], null);
  },
  [SUBMISSION_APPLYWORKFLOW_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['executed', id, 'status'], 'inflight');
  },
  [SUBMISSION_APPLYWORKFLOW_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['executed', id, 'status'], 'error');
    set(state, ['executed', id, 'error'], action.error);
  },

  [SUBMISSION_REMOVE]: (state, action) => {
    const { id } = action;
    set(state, ['removed', id, 'status'], 'success');
    set(state, ['removed', id, 'error'], null);
  },
  [SUBMISSION_REMOVE_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['removed', id, 'status'], 'inflight');
  },
  [SUBMISSION_REMOVE_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['removed', id, 'status'], 'error');
    set(state, ['removed', id, 'error'], action.error);
  },

  [SUBMISSION_DELETE]: (state, action) => {
    const { id } = action;
    set(state, ['deleted', id, 'status'], 'success');
    set(state, ['deleted', id, 'error'], null);
  },
  [SUBMISSION_DELETE_INFLIGHT]: (state, action) => {
    const { id } = action;
    set(state, ['deleted', id, 'status'], 'inflight');
  },
  [SUBMISSION_DELETE_ERROR]: (state, action) => {
    const { id } = action;
    set(state, ['deleted', id, 'status'], 'error');
    set(state, ['deleted', id, 'error'], action.error);
  },

  [SEARCH_SUBMISSIONS]: (state, action) => {
    set(state, ['list', 'params', 'prefix'], action.prefix);
  },
  [CLEAR_SUBMISSIONS_SEARCH]: (state, action) => {
    set(state, ['list', 'params', 'prefix'], null);
  },

  [FILTER_SUBMISSIONS]: (state, action) => {
    set(state, ['list', 'params', action.param.key], action.param.value);
  },
  [CLEAR_SUBMISSIONS_FILTER]: (state, action) => {
    set(state, ['list', 'params', action.paramKey], null);
  },

  [OPTIONS_SUBMISSIONNAME]: (state, action) => {
    const { id } = action;
    const options = action.data.results.reduce(
      (obj, { name }) =>
        Object.assign(obj, {
          [`${name}`]: id
        }),
      {}
    );
    set(state, ['dropdowns', 'name', 'options'], options);
  },
  [OPTIONS_SUBMISSIONNAME_INFLIGHT]: () => {},
  [OPTIONS_SUBMISSIONNAME_ERROR]: (state, action) => {
    set(state, ['dropdowns', 'name', 'options'], []);
    set(state, ['list', 'error'], action.error);
  }
});
