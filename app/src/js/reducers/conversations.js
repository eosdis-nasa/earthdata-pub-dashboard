'use strict';

import { get, set, del } from 'object-path';
import {
  CONVERSATION,
  CONVERSATION_INFLIGHT,
  CONVERSATION_ERROR,
  CONVERSATIONS,
  CONVERSATIONS_INFLIGHT,
  CONVERSATIONS_ERROR,
  CONVERSATION_REPLY_INFLIGHT,
  CONVERSATION_ADD_USER_INFLIGHT
} from '../actions/types';
import { createReducer } from '@reduxjs/toolkit';
import assignDate from './assign-date';

export const initialState = {
  conversation: {
    data: {},
    meta: {},
    inflight: false,
    error: null
  },
  list: {
    data: [],
    meta: {},
    inflight: false,
    error: null
  }
};

export default createReducer(initialState, {
  [CONVERSATION]: (state, action) => {
    set(state, 'conversation.data', action.data);
    set(state, 'conversation.meta', assignDate(action.data.meta));
    set(state, 'conversation.inflight', false);
    set(state, 'conversation.error', null);
  },
  [CONVERSATION_INFLIGHT]: (state, action) => {
    set(state, 'conversation.inflight', true);
  },
  [CONVERSATION_ERROR]: (state, action) => {
    set(state, 'conversation.inflight', false);
    set(state, 'conversation.error', action.error);
  },
  [CONVERSATIONS]: (state, action) => {
    set(state, 'list.data', action.data);
    set(state, 'list.meta', assignDate(action.data.meta))
    set(state, 'list.inflight', false);
    set(state, 'list.error', null);
  },
  [CONVERSATIONS_INFLIGHT]: (state, action) => {
    set(state, 'list.inflight', true);
  },
  [CONVERSATIONS_ERROR]: (state, action) => {
    set(state, 'list.inflight', false);
    set(state, 'list.error', action.error);
  },
  [CONVERSATION_REPLY_INFLIGHT]: (state, action) => {
    set(state, 'conversation.inflight', true);
  },
  [CONVERSATION_ADD_USER_INFLIGHT]: (state, action) => {
    set(state, 'conversation.inflight', true);
  }
});
