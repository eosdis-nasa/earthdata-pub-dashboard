'use strict';

import compareVersions from 'compare-versions';
import requestPromise from 'request-promise';
import { history } from '../store/configureStore';
import { configureRequest } from './helpers';
import _config from '../config';
import { fetchCurrentTimeFilters } from '../utils/datepicker';
import { authHeader } from '../utils/basic-auth';
import { apiGatewaySearchTemplate } from './action-config/apiGatewaySearch';
import { apiLambdaSearchTemplate } from './action-config/apiLambdaSearch';
import { teaLambdaSearchTemplate } from './action-config/teaLambdaSearch';
import { s3AccessSearchTemplate } from './action-config/s3AccessSearch';
import * as types from './types';

const CALL_API = types.CALL_API;
const {
  esRoot,
  showDistributionAPIMetrics,
  showTeaMetrics,
  apiRoot: root,
  formsUrl,
  defaultPageLimit,
  minCompatibleApiVersion
} = _config;

const redirects = {
  forms: formsUrl
};

export const redirectWithToken = (redirect, token) => {
  if (redirects[redirect]) {
    const redirectUrl = new URL(redirects[redirect]);
    redirectUrl.searchParams.set('token', token);
    window.location.href = redirectUrl.href;
  } else {
    history.push('/');
  }
};

export const fetchToken = (code, state) => {
  return (dispatch) => {
    dispatch({
      [CALL_API]: {
        type: types.FETCH_TOKEN,
        method: 'GET',
        id: null,
        path: 'token',
        qs: { code, state }
      }
    })
      .then(({ data }) => {
        redirectWithToken(state, data.token);
      });
  };
};

export const login = (redirect) => {
  return (dispatch) => {
    dispatch({
      [CALL_API]: {
        type: types.LOGIN,
        method: 'GET',
        id: null,
        path: 'token',
        qs: { state: redirect }
      }
    })
      .then(({ data }) => {
        window.location.href = data.redirect;
      });
  };
};

export const setTokenState = (token) => ({ type: types.SET_TOKEN, token });

export const interval = function (action, wait, immediate) {
  if (immediate) { action(); }
  const intervalId = setInterval(action, wait);
  return () => clearInterval(intervalId);
};

export const getApiVersion = () => {
  return (dispatch) => {
    const config = configureRequest({
      method: 'GET',
      url: new URL('version', root).href,
      // make sure request failures are sent to .catch()
      simple: true
    });
    return requestPromise(config)
      .then(({ body }) => dispatch({
        type: types.API_VERSION,
        payload: { versionNumber: body.api_version }
      }))
      .then(() => dispatch(checkApiVersion()))
      .catch(({ error }) => dispatch({
        type: types.API_VERSION_ERROR,
        payload: { error }
      }));
  };
};

export const checkApiVersion = () => {
  return (dispatch, getState) => {
    const { versionNumber } = getState().apiVersion;
    if (compareVersions(versionNumber, minCompatibleApiVersion) >= 0) {
      dispatch({
        type: types.API_VERSION_COMPATIBLE
      });
    } else {
      dispatch({
        type: types.API_VERSION_INCOMPATIBLE,
        payload: {
          warning: `Dashboard incompatible with Earthdata Pub API version (${versionNumber}), dashboard requires (>= ${minCompatibleApiVersion})`
        }
      });
    }
  };
};

export const getEarthdatapubInstanceMetadata = () => ({
  [CALL_API]: {
    type: types.ADD_INSTANCE_META,
    method: 'GET',
    path: 'instanceMeta'
  }
});

export const getSubmission = (submissionId) => ({
  [CALL_API]: {
    type: types.SUBMISSION,
    method: 'GET',
    id: submissionId,
    path: `data/submission/${submissionId}`
  }
});

export const listSubmissions = (options) => ({
  [CALL_API]: {
    type: types.SUBMISSIONS,
    method: 'GET',
    id: null,
    path: 'data/submissions',
    qs: Object.assign({ per_page: defaultPageLimit }, options)
  }
});

export const updateSubmissionMetadata = (payload) => ({
  [CALL_API]: {
    type: types.SUBMISSION_UPDATE_METADATA,
    method: 'POST',
    path: 'submission/metadata',
    body: payload
  }
});

export const getQuestion = (questionId) => ({
  [CALL_API]: {
    type: types.QUESTION,
    method: 'GET',
    id: questionId,
    path: `data/question/${questionId}`
  }
});

export const listQuestions = (options) => {
  return (dispatch, getState) => {
    // const timeFilters = fetchCurrentTimeFilters(getState().datepicker);
    return dispatch({
      [CALL_API]: {
        type: types.QUESTIONS,
        method: 'GET',
        id: null,
        url: new URL('data/questions', root).href,
        qs: Object.assign({ per_page: defaultPageLimit }, options)
      }
    });
  };
};

export const getModel = (model) => ({
  [CALL_API]: {
    type: types.MODEL,
    method: 'GET',
    id: model,
    path: `model/${model}`
  }
});

export const applyWorkflowToSubmission = (submissionId, workflow) => ({
  [CALL_API]: {
    type: types.SUBMISSION_APPLYWORKFLOW,
    method: 'PUT',
    id: submissionId,
    path: `submissions/${submissionId}`,
    body: {
      action: 'applyWorkflow',
      workflow
    }
  }
});

export const deleteSubmission = (submissionId) => ({
  [CALL_API]: {
    type: types.SUBMISSION_DELETE,
    method: 'DELETE',
    id: submissionId,
    path: `submissions/${submissionId}`
  }
});

export const searchSubmissions = (prefix) => ({ type: types.SEARCH_SUBMISSIONS, prefix: prefix });
export const clearSubmissionsSearch = () => ({ type: types.CLEAR_SUBMISSIONS_SEARCH });
export const filterSubmissions = (param) => ({ type: types.FILTER_SUBMISSIONS, param: param });
export const clearSubmissionsFilter = (paramKey) => ({ type: types.CLEAR_SUBMISSIONS_FILTER, paramKey: paramKey });

export const filterStages = (param) => ({ type: types.FILTER_STAGES, param: param });
export const clearStagesFilter = (paramKey) => ({ type: types.CLEAR_STAGES_FILTER, paramKey: paramKey });

export const filterStatuses = (param) => ({ type: types.FILTER_STATUSES, param: param });
export const clearStatusesFilter = (paramKey) => ({ type: types.CLEAR_STATUSES_FILTER, paramKey: paramKey });

export const getOptionsSubmissionName = (options) => ({
  [CALL_API]: {
    type: types.OPTIONS_SUBMISSIONNAME,
    method: 'GET',
    url: new URL('data/submissions', root).href,
    qs: { limit: 100, fields: 'long_name' }
  }
});

export const getStats = (options) => {
  return (dispatch, getState) => {
    const timeFilters = fetchCurrentTimeFilters(getState().datepicker);
    return dispatch({
      [CALL_API]: {
        type: types.STATS,
        method: 'GET',
        url: new URL('stats', root).href,
        qs: { ...options, ...timeFilters }
      }
    });
  };
};

export const getDistApiGatewayMetrics = (earthdatapubInstanceMeta) => {
  if (!esRoot) return { type: types.NOOP };
  return (dispatch, getState) => {
    const stackName = earthdatapubInstanceMeta.stackName;
    const timeFilters = fetchCurrentTimeFilters(getState().datepicker);
    const endTime = timeFilters.timestamp__to || Date.now();
    const startTime = timeFilters.timestamp__from || 0;
    return dispatch({
      [CALL_API]: {
        type: types.DIST_APIGATEWAY,
        skipAuth: true,
        method: 'POST',
        url: `${esRoot}/_search/`,
        headers: authHeader(),
        body: JSON.parse(apiGatewaySearchTemplate(stackName, startTime, endTime))
      }
    });
  };
};

export const getDistApiLambdaMetrics = (earthdatapubInstanceMeta) => {
  if (!esRoot) return { type: types.NOOP };
  if (!showDistributionAPIMetrics) return { type: types.NOOP };
  return (dispatch, getState) => {
    const stackName = earthdatapubInstanceMeta.stackName;
    const timeFilters = fetchCurrentTimeFilters(getState().datepicker);
    const endTime = timeFilters.timestamp__to || Date.now();
    const startTime = timeFilters.timestamp__from || 0;
    return dispatch({
      [CALL_API]: {
        type: types.DIST_API_LAMBDA,
        skipAuth: true,
        method: 'POST',
        url: `${esRoot}/_search/`,
        headers: authHeader(),
        body: JSON.parse(apiLambdaSearchTemplate(stackName, startTime, endTime))
      }
    });
  };
};

export const getTEALambdaMetrics = (earthdatapubInstanceMeta) => {
  if (!esRoot) return { type: types.NOOP };
  if (!showTeaMetrics) return { type: types.NOOP };
  return (dispatch, getState) => {
    const stackName = earthdatapubInstanceMeta.stackName;
    const timeFilters = fetchCurrentTimeFilters(getState().datepicker);
    const endTime = timeFilters.timestamp__to || Date.now();
    const startTime = timeFilters.timestamp__from || 0;
    return dispatch({
      [CALL_API]: {
        type: types.DIST_TEA_LAMBDA,
        skipAuth: true,
        method: 'POST',
        url: `${esRoot}/_search/`,
        headers: authHeader(),
        body: JSON.parse(teaLambdaSearchTemplate(stackName, startTime, endTime))
      }
    });
  };
};

export const getDistS3AccessMetrics = (earthdatapubInstanceMeta) => {
  if (!esRoot) return { type: types.NOOP };
  return (dispatch, getState) => {
    const stackName = earthdatapubInstanceMeta.stackName;
    const timeFilters = fetchCurrentTimeFilters(getState().datepicker);
    const endTime = timeFilters.timestamp__to || Date.now();
    const startTime = timeFilters.timestamp__from || 0;
    return dispatch({
      [CALL_API]: {
        type: types.DIST_S3ACCESS,
        skipAuth: true,
        method: 'POST',
        url: `${esRoot}/_search/`,
        headers: authHeader(),
        body: JSON.parse(s3AccessSearchTemplate(stackName, startTime, endTime))
      }
    });
  };
};

// count queries *must* include type and field properties.
export const getCount = (options) => {
  return (dispatch, getState) => {
    const timeFilters = fetchCurrentTimeFilters(getState().datepicker);
    return dispatch({
      [CALL_API]: {
        type: types.COUNT,
        method: 'GET',
        id: null,
        url: new URL('stats/aggregate', root).href,
        qs: Object.assign({ type: 'must-include-type', field: 'status' }, options, timeFilters)
      }
    });
  };
};

export const listForms = (options) => {
  return (dispatch, getState) => {
    // const timeFilters = fetchCurrentTimeFilters(getState().datepicker);
    return dispatch({
      [CALL_API]: {
        type: types.FORMS,
        method: 'GET',
        id: null,
        url: new URL('data/forms', root).href,
        qs: Object.assign({ per_page: defaultPageLimit }, options)
      }
    });
  };
};

export const getOptionsFormGroup = () => ({
  [CALL_API]: {
    type: types.OPTIONS_FORMGROUP,
    method: 'GET',
    url: new URL('forms', root).href,
    qs: { limit: 100, fields: 'long_name' }
  }
});

export const getForm = (formId) => ({
  [CALL_API]: {
    type: types.FORM,
    id: formId,
    method: 'GET',
    path: `data/form/${formId}`
  }
});

export const searchForms = (prefix) => ({ type: types.SEARCH_FORMS, prefix: prefix });
export const clearFormsSearch = () => ({ type: types.CLEAR_FORMS_SEARCH });
export const filterForms = (param) => ({ type: types.FILTER_FORMS, param: param });
export const clearFormsFilter = (paramKey) => ({ type: types.CLEAR_FORMS_FILTER, paramKey: paramKey });

export const listUsers = (options) => ({
  [CALL_API]: {
    type: types.USERS,
    method: 'GET',
    id: null,
    path: 'data/users',
    qs: Object.assign({ per_page: defaultPageLimit }, options)
  }
});

export const getOptionsUserGroup = () => ({
  [CALL_API]: {
    type: types.OPTIONS_USERGROUP,
    method: 'GET',
    url: new URL('users', root).href,
    qs: { limit: 100, fields: 'long_name' }
  }
});

export const getUser = (userId) => ({
  [CALL_API]: {
    type: types.USER,
    id: userId,
    method: 'GET',
    path: `data/user/${userId}`
  }
});

export const searchUsers = (prefix) => ({ type: types.SEARCH_USERS, prefix: prefix });
export const clearUsersSearch = () => ({ type: types.CLEAR_USERS_SEARCH });
export const filterUsers = (param) => ({ type: types.FILTER_USERS, param: param });
export const clearUsersFilter = (paramKey) => ({ type: types.CLEAR_USERS_FILTER, paramKey: paramKey });

export const listGroups = (options) => ({
  [CALL_API]: {
    type: types.GROUPS,
    method: 'GET',
    id: null,
    path: 'data/groups',
    qs: Object.assign({ per_page: defaultPageLimit }, options)
  }
});

export const getOptionsGroupGroup = () => ({
  [CALL_API]: {
    type: types.OPTIONS_GROUPGROUP,
    method: 'GET',
    url: new URL('groups', root).href,
    qs: { limit: 100, fields: 'long_name' }
  }
});

export const getGroup = (groupId) => ({
  [CALL_API]: {
    type: types.GROUP,
    id: groupId,
    method: 'GET',
    path: `data/group/${groupId}`
  }
});

export const createGroup = (groupId, payload) => ({
  [CALL_API]: {
    type: types.NEW_GROUP,
    id: groupId,
    method: 'POST',
    path: 'data/groups',
    body: payload
  }
});

export const updateGroup = (groupId, payload) => ({
  [CALL_API]: {
    type: types.UPDATE_GROUP,
    id: groupId,
    method: 'PUT',
    path: `data/groups/${groupId}`,
    body: payload
  }
});

export const clearUpdateGroup = (groupId) => ({ type: types.UPDATE_GROUP_CLEAR, id: groupId });

export const deleteGroup = (groupId) => ({
  [CALL_API]: {
    type: types.GROUP_DELETE,
    id: groupId,
    method: 'DELETE',
    path: `data/groups/${groupId}`
  }
});

export const searchGroups = (prefix) => ({ type: types.SEARCH_GROUPS, prefix: prefix });
export const clearGroupsSearch = () => ({ type: types.CLEAR_GROUPS_SEARCH });
export const filterGroups = (param) => ({ type: types.FILTER_GROUPS, param: param });
export const clearGroupsFilter = (paramKey) => ({ type: types.CLEAR_GROUPS_FILTER, paramKey: paramKey });

export const getLogs = (options) => {
  return (dispatch, getState) => {
    const timeFilters = fetchCurrentTimeFilters(getState().datepicker);
    return dispatch({
      [CALL_API]: {
        type: types.LOGS,
        method: 'GET',
        url: new URL('logs', root).href,
        qs: Object.assign({ limit: 100 }, options, timeFilters)
      }
    });
  };
};

export const clearLogs = () => ({ type: types.CLEAR_LOGS });

export const logout = () => ({ type: types.LOGOUT });

export const deleteToken = () => ({ type: types.DELETE_TOKEN });

export const loginError = (error) => {
  return (dispatch) => {
    return dispatch(deleteToken())
      .then(() => dispatch({ type: 'LOGIN_ERROR', error }))
      .then(() => history.push('/auth'));
  };
};

export const getSchema = (type) => ({
  [CALL_API]: {
    type: types.SCHEMA,
    method: 'GET',
    path: `schemas/${type}`
  }
});

export const listWorkflows = (options) => ({
  [CALL_API]: {
    type: types.WORKFLOWS,
    method: 'GET',
    url: new URL('data/workflows', root).href,
    qs: Object.assign({ per_page: defaultPageLimit }, options)
  }
});
export const getWorkflow = (workflowId) => ({
  [CALL_API]: {
    type: types.WORKFLOW,
    id: workflowId,
    method: 'GET',
    path: `data/workflow/${workflowId}`
  }
});
export const searchWorkflows = (searchString) => ({ type: types.SEARCH_WORKFLOWS, searchString });
export const clearWorkflowsSearch = () => ({ type: types.CLEAR_WORKFLOWS_SEARCH });

export const listMetrics = (options) => ({
  [CALL_API]: {
    type: types.METRICS,
    method: 'GET',
    url: new URL('metrics', root).href,
    qs: Object.assign({ per_page: defaultPageLimit }, options)
  }
});
export const searchMetrics = (searchString) => ({ type: types.SEARCH_METRICS, searchString });
export const clearMetricsSearch = () => ({ type: types.CLEAR_METRICS_SEARCH });

export const listRoles = (options) => ({
  [CALL_API]: {
    type: types.ROLES,
    method: 'GET',
    url: new URL('data/roles', root).href,
    qs: Object.assign({ limit: defaultPageLimit }, options)
  }
});
export const searchRoles = (searchString) => ({ type: types.SEARCH_ROLES, searchString });
export const clearRolesSearch = () => ({ type: types.CLEAR_ROLES_SEARCH });
