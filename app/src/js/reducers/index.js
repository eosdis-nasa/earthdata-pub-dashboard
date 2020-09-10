import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import api from './api';
import apiVersion from './api-version';
import collections from './collections';
import config from './config';
import dist from './dist';
import datepicker from './datepicker';
import granules from './granules';
import submissions from './submissions';
import granuleCSV from './granule-csv';
import stats from './stats';
import pdrs from './pdrs';
import providers from './providers';
import forms from './forms';
import users from './users';
import groups from './groups';
import logs from './logs';
import schema from './schema';
import workflows from './workflows';
import metrics from './metrics';
import executions from './executions';
import executionStatus from './execution-status';
import executionLogs from './execution-logs';
import operations from './operations';
import rules from './rules';
import reconciliationReports from './reconciliation-reports';
import mmtLinks from './mmtLinks';
import earthdatapubInstance from './earthdatapub-instance';

const def = (state = {}, action) => state;

export const reducers = {
  def,
  api,
  apiVersion,
  collections,
  config,
  dist,
  datepicker,
  mmtLinks,
  earthdatapubInstance,
  granules,
  submissions,
  granuleCSV,
  stats,
  pdrs,
  providers,
  forms,
  users,
  groups,
  logs,
  schema,
  workflows,
  metrics,
  executions,
  executionStatus,
  executionLogs,
  operations,
  rules,
  reconciliationReports
};

export const createRootReducer = (history) => combineReducers({
  router: connectRouter(history),
  ...reducers
});
