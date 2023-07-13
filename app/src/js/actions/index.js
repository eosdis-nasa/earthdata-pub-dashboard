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

export const refreshToken = () => {
  return (dispatch) => {
    dispatch({
      [CALL_API]: {
        type: types.FETCH_TOKEN,
        method: 'GET',
        id: null,
        path: 'token/refresh',
        qs: { refresh: true }
      }
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

export const timeout = function (action, wait) {
  const timeoutId = setTimeout(action, wait);
  return () => clearTimeout(timeoutId);
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

/* export const getEarthdatapubInstanceMetadata = () => ({
  [CALL_API]: {
    type: types.ADD_INSTANCE_META,
    method: 'GET',
    path: 'instanceMeta'
  }
}); */

export const getRequest = (requestId) => ({
  [CALL_API]: {
    type: types.REQUEST,
    method: 'GET',
    id: requestId,
    path: `data/submission/${requestId}`
  }
});

export const getDaac = (daacId) => {
  return (dispatch) => {
    return dispatch({
      [CALL_API]: {
        type: types.DAAC,
        method: 'GET',
        id: daacId,
        path: `data/daac/${daacId}`
      }
    });
  };
};

export const getRequestByStepType = (stepType) => ({
  [CALL_API]: {
    type: types.REQUESTS,
    method: 'GET',
    id: null,
    url: new URL(`data/submissions?step_type=${stepType}`, root).href,
  }
});

export const getInProgressRequests = () => ({
  [CALL_API]: {
    type: types.REQUESTS,
    method: 'GET',
    id: null,
    url: new URL('data/submissions?step_type=%21close', root).href,
  }
});

export const getContributers = (payload) => ({
  [CALL_API]: {
    type: types.USERS,
    method: 'POST',
    path: 'user/get_users',
    body: payload
  }
});

export const listRequests = (options) => ({
  [CALL_API]: {
    type: types.REQUESTS,
    method: 'POST',
    id: null,
    path: 'data/submission/operation/active'
  }
});

export const listInactiveRequests = (options) => ({
  [CALL_API]: {
    type: types.REQUESTS,
    method: 'POST',
    id: null,
    path: 'data/submission/operation/inactive'
  }
});

export const setWorkflowStep = (payload) => ({
  [CALL_API]: {
    type: types.REQUESTS,
    method: 'POST',
    path: 'data/submission/operation/changeStep',
    body: payload
  }
});

export const copyRequest = (payload) => ({
  [CALL_API]: {
    type: types.REQUESTS,
    method: 'POST',
    path: 'data/submission/operation/copySubmission',
    body: payload
  }
});

export const reviewRequest = (id, approve) => {
  return (dispatch) => {
    dispatch({
      [CALL_API]: {
        type: types.REQUEST_REVIEW,
        method: 'POST',
        path: 'data/submission/operation/review',
        body: { id, approve }
      }
    })
      .then(() => {
        dispatch(getRequest(id));
      });
  };
};

export const updateRequestMetadata = (payload) => ({
  [CALL_API]: {
    type: types.REQUEST_UPDATE_METADATA,
    method: 'POST',
    path: 'data/submission/operation/metadata',
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

export const updateQuestion = (payload) => ({
  [CALL_API]: {
    type: types.QUESTIONS,
    method: 'POST',
    path: `data/question/${payload.id}`,
    json: payload
  }
});

export const addQuestion = (payload) => ({
  [CALL_API]: {
    type: types.QUESTIONS,
    method: 'POST',
    path: 'data/questions',
    json: payload
  }
});

export const updateInputs = (questionId, payload) => ({
  [CALL_API]: {
    type: types.INPUTS,
    method: 'POST',
    path: `data/question/${questionId}/inputs`,
    json: payload
  }
});

export const clearUpdateQuestion = (questionId) => ({ type: types.UPDATE_QUESTIONS_CLEAR, id: questionId });

export const getModel = (model) => ({
  [CALL_API]: {
    type: types.MODEL,
    method: 'GET',
    id: model,
    path: `model/${model}`
  }
});

export const getModuleUi = (moduleName) => ({
  [CALL_API]: {
    type: types.GET_MODULE_UI,
    method: 'GET',
    id: null,
    path: `module/${moduleName}`
  }
});

export const listModules = () => ({
  [CALL_API]: {
    type: types.LIST_MODULES,
    method: 'GET',
    id: null,
    path: 'module'
  }
});

export const applyWorkflowToRequest = (requestId, workflowId) => ({
  [CALL_API]: {
    type: types.REQUEST_APPLYWORKFLOW,
    method: 'POST',
    path: 'data/submission/operation/apply',
    body: {
      id: requestId,
      workflow_id: workflowId
    }
  }
});

export const withdrawRequest = (requestId) => ({
  [CALL_API]: {
    type: types.REQUEST_WITHDRAW,
    method: 'POST',
    path: 'data/submission/operation/withdraw',
    body: { id: requestId }
  }
});

export const restoreRequest = (requestId) => ({
  [CALL_API]: {
    type: types.REQUEST_RESTORE,
    method: 'POST',
    path: 'data/submission/operation/restore',
    body: { id: requestId }
  }
});

export const addUserToRequest = (payload) => ({
  [CALL_API]: {
    type: types.REQUEST_ADDUSER,
    method: 'POST',
    path: 'data/submission/operation/addContributors',
    json: payload
  }
});

export const removeUserFromRequest = (requestId, userId) => ({
  [CALL_API]: {
    type: types.REQUEST_DELETEUSER,
    method: 'POST',
    path: 'data/submission/operation/removeContributor',
    body: { id: requestId, contributor_id: userId }
  }
});

export const deleteRequest = (requestId) => ({
  [CALL_API]: {
    type: types.REQUEST_DELETE,
    method: 'DELETE',
    id: requestId,
    path: `submissions/${requestId}`
  }
});

export const searchRequests = (prefix) => ({ type: types.SEARCH_REQUESTS, prefix: prefix });
export const clearRequestsSearch = () => ({ type: types.CLEAR_REQUESTS_SEARCH });
export const filterRequests = (param) => ({ type: types.FILTER_REQUESTS, param: param });
export const clearRequestsFilter = (paramKey) => ({ type: types.CLEAR_REQUESTS_FILTER, paramKey: paramKey });

export const filterStages = (param) => ({ type: types.FILTER_STAGES, param: param });
export const clearStagesFilter = (paramKey) => ({ type: types.CLEAR_STAGES_FILTER, paramKey: paramKey });

export const filterStatuses = (param) => ({ type: types.FILTER_STATUSES, param: param });
export const clearStatusesFilter = (paramKey) => ({ type: types.CLEAR_STATUSES_FILTER, paramKey: paramKey });

export const getOptionsRequestName = (options) => ({
  [CALL_API]: {
    type: types.OPTIONS_REQUESTNAME,
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
    url: new URL('data/forms', root).href,
    qs: { limit: 100, fields: 'long_name' }
  }
});

export const getForm = (formId, daacId) => ({
  [CALL_API]: {
    type: types.FORM,
    id: formId,
    method: 'GET',
    path: daacId ? `data/form/${formId}?daac_id=${daacId}` : `data/form/${formId}`
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
    path: 'user/find',
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
    method: 'GET',
    id: userId,
    path: `data/user/${userId}`
  }
});

export const addUserRole = (payload) => {
  return (dispatch) => {
    dispatch({
      [CALL_API]: {
        type: types.USER_ADDROLE,
        method: 'POST',
        path: 'user/add_role',
        body: payload
      }
    })
      .then(() => {
        dispatch(getUser(payload.id));
      });
  };
};

export const removeUserRole = (payload) => {
  return (dispatch) => {
    dispatch({
      [CALL_API]: {
        type: types.USER_REMOVEROLE,
        method: 'POST',
        path: 'user/remove_role',
        body: payload
      }
    })
      .then(() => {
        dispatch(getUser(payload.id));
      });
  };
};

export const addUserGroup = (payload) => {
  return (dispatch) => {
    dispatch({
      [CALL_API]: {
        type: types.USER_ADDGROUP,
        method: 'POST',
        path: 'user/add_group',
        body: payload
      }
    })
      .then(() => {
        dispatch(getUser(payload.id));
      });
  };
};

export const removeUserGroup = (payload) => {
  return (dispatch) => {
    dispatch({
      [CALL_API]: {
        type: types.USER_REMOVEGROUP,
        method: 'POST',
        path: 'user/remove_group',
        body: payload
      }
    })
      .then(() => {
        dispatch(getUser(payload.id));
      });
  };
};

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
    path: `data/group/${groupId}`,
    body: payload
  }
});

export const clearUpdateGroup = (groupId) => ({ type: types.UPDATE_GROUP_CLEAR, id: groupId });

export const deleteGroup = (groupId) => ({
  [CALL_API]: {
    type: types.GROUP_DELETE,
    id: groupId,
    method: 'DELETE',
    path: `data/group/${groupId}`
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

export const logout = () => {
  return (dispatch) => {
    dispatch({ type: types.LOGOUT });
    history.push('/auth');
  };
};

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
    path: `model/${type}`
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

export const updateWorkflow = (payload) => ({
  [CALL_API]: {
    type: types.WORKFLOWS,
    method: 'POST',
    path: `data/workflow/${payload.id}`,
    json: payload
  }
});

export const addWorkflow = (payload) => ({
  [CALL_API]: {
    type: types.WORKFLOWS,
    method: 'POST',
    path: 'data/workflows',
    json: payload
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

export const getCloudMetric = (cloudMetricId) => ({
  [CALL_API]: {
    type: types.CLOUD_METRIC,
    method: 'GET',
    id: cloudMetricId,
    path: `metrics/report/${cloudMetricId}`
  }
});

export const listCloudMetrics = (options) => ({
  [CALL_API]: {
    type: types.CLOUD_METRICS,
    method: 'GET',
    path: 'metrics/reports',
    qs: Object.assign({ limit: defaultPageLimit }, options)
  }
});
export const searchCloudMetrics = (searchString) => ({ type: types.SEARCH_CLOUD_METRICS, searchString });
export const clearCloudMetricsSearch = () => ({ type: types.CLEAR_CLOUD_METRICS_SEARCH });

export const getRole = (roleId) => ({
  [CALL_API]: {
    type: types.ROLE,
    method: 'GET',
    id: roleId,
    path: `data/role/${roleId}`
  }
});

export const listRoles = (options) => ({
  [CALL_API]: {
    type: types.ROLES,
    method: 'GET',
    path: 'data/roles',
    qs: Object.assign({ limit: defaultPageLimit }, options)
  }
});
export const searchRoles = (searchString) => ({ type: types.SEARCH_ROLES, searchString });
export const clearRolesSearch = () => ({ type: types.CLEAR_ROLES_SEARCH });

export const getConversation = (conversationId, level = false) => ({
  [CALL_API]: {
    type: types.CONVERSATION,
    method: 'GET',
    id: conversationId,
    path: `notification/conversation/${conversationId}?detailed=${level}`
  }
});

export const listConversations = (options) => ({
  [CALL_API]: {
    type: types.CONVERSATIONS,
    method: 'GET',
    path: 'notification/conversations',
    qs: Object.assign({ limit: defaultPageLimit }, options)
  }
});
export const getConversations = (payload) => ({
  [CALL_API]: {
    type: types.CONVERSATIONS,
    method: 'GET',
    path: `notification/conversation/${payload.conversation_id}?detailed=${payload.level}&step_name=${payload.step_name}`,
    body: payload
  }
});

export const createConversation = (payload) => ({
  [CALL_API]: {
    type: types.CONVERSATION_CREATE,
    method: 'POST',
    path: 'notification/send',
    body: payload
  }
});

export const replyConversation = (payload) => {
  return (dispatch) => {
    dispatch({
      [CALL_API]: {
        type: types.CONVERSATION_REPLY,
        method: 'POST',
        path: 'notification/reply',
        body: payload
      }
    })
      .then(() => {
        setTimeout(() => {
          dispatch(getConversation(payload.conversation_id));
        }, 1000);
      });
  };
};

export const addUsersToConversation = (payload) => {
  return (dispatch) => {
    dispatch({
      [CALL_API]: {
        type: types.CONVERSATION_ADD_USER,
        method: 'POST',
        path: 'notification/add_user',
        body: payload
      }
    })
      .then(() => {
        setTimeout(() => {
          dispatch(getConversation(payload.conversation_id));
        }, 1000);
      });
  };
};

export const updateSearchModal = (path, query) => ({
  [CALL_API]: {
    type: types.SEARCH_MODAL,
    method: 'GET',
    path,
    qs: Object.assign(query)
  }
});

export const createUser = (payload) => ({
  [CALL_API]: {
    type: types.USER_CREATE,
    method: 'POST',
    path: 'user/create',
    body: payload
  }
});

