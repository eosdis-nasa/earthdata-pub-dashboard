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
import mymetrics from "./mymetrics";
import steps from './steps';

const paths = [requests, forms, questions, handler, users, groups, workflows, roles, conversations, steps, mymetrics];
export default paths;
