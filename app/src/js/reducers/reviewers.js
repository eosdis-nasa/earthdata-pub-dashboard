'use strict';
import { set } from 'object-path';
import {
    REQUEST_REVIEWERS,
    REQUEST_REVIEWERS_INFLIGHT,
    REQUEST_REVIEWERS_ERROR,  
} from '../actions/types';
import { createReducer } from '@reduxjs/toolkit';

export const initialState = {
    inflight: false,
    error: null,
    receivedOnce: false,
    data: []
};

export default createReducer(initialState, {
    [REQUEST_REVIEWERS]: (state, action) => {
        const { data } = action;
        set(state, ['inflight'], false);
        set(state, ['receivedOnce'], true);
        set(state, ['data'], data);
        set(state, ['error'], null);
    },
    [REQUEST_REVIEWERS_INFLIGHT]: (state) => {
        set(state, ['inflight'], true);
    },
    [REQUEST_REVIEWERS_ERROR]: (state, action) => {
        set(state, ['inflight'], false);
        set(state, ['error'], action.error);
    }
});