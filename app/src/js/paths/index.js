'use strict';
import requests from './requests';
import forms from './forms';
import questions from './questions';
import users from './users';
import groups from './groups';
import roles from './roles';
import workflows from './workflows';
import conversations from './conversations';
import handler from "./metrics";

const paths = [requests, forms, questions, handler, users, groups, workflows, roles, conversations];
export default paths;
