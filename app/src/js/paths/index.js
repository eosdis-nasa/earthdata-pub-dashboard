'use strict';
import collections from './collections';
import granules from './granules';
import submissions from './submissions';
import pdrs from './pdrs';
import providers from './providers';
import forms from './forms';
import users from './users';
import groups from './groups';
import errors from './errors';
import workflows from './workflows';
import executions from './executions';
import operations from './operations';
import rules from './rules';
import reconciliationReports from './reconciliation-reports';

const paths = [collections, granules, submissions, pdrs, providers, forms, users, groups, errors, workflows, executions, operations, rules, reconciliationReports];
export default paths;
