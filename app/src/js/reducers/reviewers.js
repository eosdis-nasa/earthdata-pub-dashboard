'use strict';
import { set } from 'object-path';
import assignDate from './assign-date';
import {
    REQUEST_GET_REVIEWERS,
    REQUEST_GET_REVIEWERS_INFLIGHT,
    REQUEST_GET_REVIEWERS_ERROR,  
} from '../actions/types';
import { createReducer } from '@reduxjs/toolkit';

export const initialState = {
    inflight: false,
    error: null,
    data: []
};

export default createReducer(initialState, {
    [REQUEST_GET_REVIEWERS]: (state, action) => {
        const { data } = action;
        set(state, ['inflight'], false);
        set(state, ['data'], data);
        set(state, ['error'], null);
    },
    [REQUEST_GET_REVIEWERS_INFLIGHT]: (state) => {
        set(state, ['inflight'], true);
    },
    [REQUEST_GET_REVIEWERS_ERROR]: (state, action) => {
        set(state, ['inflight'], false);
        set(state, ['error'], action.error);
    }
});