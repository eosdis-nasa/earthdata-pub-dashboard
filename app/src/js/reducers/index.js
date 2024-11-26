import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import api from './api';
import apiVersion from './api-version';
import config from './config';
import dist from './dist';
import datepicker from './datepicker';
import requests from './requests';
import stats from './stats';
import modules from './modules.js';
import model from './model';
import forms from './forms';
import questions from './questions';
import sections from './sections.js';
import users from './users';
import groups from './groups';
import logs from './logs';
import schema from './schema';
import workflows from './workflows';
import metrics from './metrics';
import roles from './roles';
import conversations from './conversations';
import searchModal from './search-modal';
import earthdatapubInstance from './earthdatapub-instance';
import dataUpload from './data-upload';
import reviewers from './reviewers.js';

const def = (state = {}, action) => state;

export const reducers = {
  def,
  api,
  apiVersion,
  config,
  dist,
  datepicker,
  earthdatapubInstance,
  requests,
  reviewers,
  stats,
  model,
  modules,
  forms,
  sections,
  questions,
  users,
  groups,
  logs,
  schema,
  workflows,
  metrics,
  roles,
  conversations,
  searchModal,
  dataUpload
};

export const createRootReducer = (history) => combineReducers({
  router: connectRouter(history),
  ...reducers
});
