'use strict';

import compareVersions from 'compare-versions';
import { get as getProperty } from 'object-path';
import requestPromise from 'request-promise';
import { history } from '../store/configureStore';
import isEmpty from 'lodash.isempty';
import cloneDeep from 'lodash.clonedeep';

import { configureRequest } from './helpers';
import _config from '../config';
import { getCollectionId, collectionNameVersion } from '../utils/format';
import { fetchCurrentTimeFilters } from '../utils/datepicker';
import log from '../utils/log';
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
  defaultPageLimit,
  minCompatibleApiVersion
} = _config;

export const refreshAccessToken = (token) => {
  return (dispatch) => {
    const start = new Date();
    log('REFRESH_TOKEN_INFLIGHT');
    dispatch({ type: types.REFRESH_TOKEN_INFLIGHT });

    const requestConfig = configureRequest({
      method: 'POST',
      url: new URL('refresh', root).href,
      body: { token },
      // make sure request failures are sent to .catch()
      simple: true
    });
    return requestPromise(requestConfig)
      .then(({ body }) => {
        const duration = new Date() - start;
        log('REFRESH_TOKEN', duration + 'ms');
        return dispatch({
          type: types.REFRESH_TOKEN,
          token: body.token
        });
      })
      .catch(({ error }) => {
        dispatch({
          type: types.REFRESH_TOKEN_ERROR,
          error
        });
        throw error;
      });
  };
};

export const setTokenState = (token) => ({ type: types.SET_TOKEN, token });

export const interval = function (action, wait, immediate) {
  if (immediate) { action(); }
  const intervalId = setInterval(action, wait);
  return () => clearInterval(intervalId);
};

export const getCollection = (name, version) => ({
  [CALL_API]: {
    type: types.COLLECTION,
    method: 'GET',
    id: getCollectionId({ name, version }),
    path: `collections?name=${name}&version=${version}`
  }
});

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
          warning: `Dashboard incompatible with Earthdatapub API version (${versionNumber}), dashboard requires (>= ${minCompatibleApiVersion})`
        }
      });
    }
  };
};

export const listCollections = (options = {}) => {
  const { listAll = false, ...queryOptions } = options;
  return (dispatch, getState) => {
    const timeFilters = listAll ? {} : fetchCurrentTimeFilters(getState().datepicker);
    const urlPath = `collections${isEmpty(timeFilters) || listAll ? '' : '/active'}`;
    return dispatch({
      [CALL_API]: {
        type: types.COLLECTIONS,
        method: 'GET',
        id: null,
        url: new URL(urlPath, root).href,
        qs: Object.assign({ limit: defaultPageLimit }, queryOptions, timeFilters)
      }
    });
  };
};

export const createCollection = (payload) => ({
  [CALL_API]: {
    type: types.NEW_COLLECTION,
    method: 'POST',
    id: getCollectionId(payload),
    path: 'collections',
    body: payload
  }
});

// include the option to specify the name and version of the collection to update in case they differ in the payload
export const updateCollection = (payload, name, version) => ({
  [CALL_API]: {
    type: types.UPDATE_COLLECTION,
    method: 'PUT',
    id: (name && version) ? getCollectionId({ name, version }) : getCollectionId(payload),
    path: `collections/${name || payload.name}/${version || payload.version}`,
    body: payload
  }
});

export const clearUpdateCollection = (collectionName) => ({ type: types.UPDATE_COLLECTION_CLEAR, id: collectionName });

export const deleteCollection = (name, version) => ({
  [CALL_API]: {
    type: types.COLLECTION_DELETE,
    method: 'DELETE',
    id: getCollectionId({ name, version }),
    path: `collections/${name}/${version}`
  }
});

export const searchCollections = (prefix) => ({ type: types.SEARCH_COLLECTIONS, prefix: prefix });
export const clearCollectionsSearch = () => ({ type: types.CLEAR_COLLECTIONS_SEARCH });
export const filterCollections = (param) => ({ type: types.FILTER_COLLECTIONS, param: param });
export const clearCollectionsFilter = (paramKey) => ({ type: types.CLEAR_COLLECTIONS_FILTER, paramKey: paramKey });

export const getEarthdatapubInstanceMetadata = () => ({
  [CALL_API]: {
    type: types.ADD_INSTANCE_META,
    method: 'GET',
    path: 'instanceMeta'
  }
});

export const getGranule = (granuleId) => ({
  [CALL_API]: {
    type: types.GRANULE,
    method: 'GET',
    id: granuleId,
    path: `granules/${granuleId}`
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

export const listSubmissions = (options) => {
  return (dispatch, getState) => {
    return dispatch({
      [CALL_API]: {
        type: types.SUBMISSIONS,
        method: 'GET',
        id: null,
        url: new URL('data/submissions', root).href,
        qs: Object.assign({ limit: defaultPageLimit }, options)
      }
    });
  };
};

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

export const listGranules = (options) => {
  return (dispatch, getState) => {
    const timeFilters = fetchCurrentTimeFilters(getState().datepicker);
    return dispatch({
      [CALL_API]: {
        type: types.GRANULES,
        method: 'GET',
        id: null,
        url: new URL('granules', root).href,
        qs: Object.assign({ limit: defaultPageLimit }, options, timeFilters)
      }
    });
  };
};

export const reprocessGranule = (granuleId) => ({
  [CALL_API]: {
    type: types.GRANULE_REPROCESS,
    method: 'PUT',
    id: granuleId,
    path: `granules/${granuleId}`,
    body: {
      action: 'reprocess'
    }
  }
});

export const applyWorkflowToCollection = (name, version, workflow) => ({
  [CALL_API]: {
    type: types.COLLECTION_APPLYWORKFLOW,
    method: 'PUT',
    id: getCollectionId({ name, version }),
    path: `collections/${name}/${version}`,
    body: {
      action: 'applyWorkflow',
      workflow
    }
  }
});

export const applyRecoveryWorkflowToCollection = (collectionId) => {
  return (dispatch) => {
    const { name, version } = collectionNameVersion(collectionId);
    return dispatch(getCollection(name, version))
      .then((collectionResponse) => {
        const collectionRecoveryWorkflow = getProperty(
          collectionResponse, 'data.results.0.meta.collectionRecoveryWorkflow'
        );
        if (collectionRecoveryWorkflow) {
          return dispatch(applyWorkflowToCollection(name, version, collectionRecoveryWorkflow));
        } else {
          throw new ReferenceError(
            `Unable to apply recovery workflow to ${collectionId} because the attribute collectionRecoveryWorkflow is not set in collection.meta`
          );
        }
      })
      .catch((error) => dispatch({
        id: collectionId,
        type: types.COLLECTION_APPLYWORKFLOW_ERROR,
        error: error
      }));
  };
};

export const applyWorkflowToGranule = (granuleId, workflow) => ({
  [CALL_API]: {
    type: types.GRANULE_APPLYWORKFLOW,
    method: 'PUT',
    id: granuleId,
    path: `granules/${granuleId}`,
    body: {
      action: 'applyWorkflow',
      workflow
    }
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

export const getCollectionByGranuleId = (granuleId) => {
  return (dispatch) => {
    return dispatch(getGranule(granuleId)).then((granuleResponse) => {
      const { name, version } = collectionNameVersion(granuleResponse.data.collectionId);
      return dispatch(getCollection(name, version));
    });
  };
};

export const applyRecoveryWorkflowToGranule = (granuleId) => {
  return (dispatch) => {
    return dispatch(getCollectionByGranuleId(granuleId))
      .then((collectionResponse) => {
        const granuleRecoveryWorkflow = getProperty(
          collectionResponse, 'data.results.0.meta.granuleRecoveryWorkflow'
        );
        if (granuleRecoveryWorkflow) {
          return dispatch(applyWorkflowToGranule(granuleId, granuleRecoveryWorkflow));
        } else {
          throw new ReferenceError(
            `Unable to apply recovery workflow to ${granuleId} because the attribute granuleRecoveryWorkflow is not set in collection.meta`
          );
        }
      })
      .catch((error) => dispatch({
        id: granuleId,
        type: types.GRANULE_APPLYWORKFLOW_ERROR,
        error: error
      }));
  };
};

export const reingestGranule = (granuleId) => ({
  [CALL_API]: {
    type: types.GRANULE_REINGEST,
    method: 'PUT',
    id: granuleId,
    path: `granules/${granuleId}`,
    body: {
      action: 'reingest'
    }
  }
});

export const removeGranule = (granuleId) => ({
  [CALL_API]: {
    type: types.GRANULE_REMOVE,
    method: 'PUT',
    id: granuleId,
    path: `granules/${granuleId}`,
    body: {
      action: 'removeFromCmr'
    }
  }
});

export const bulkGranule = (payload) => ({
  [CALL_API]: {
    type: types.BULK_GRANULE,
    method: 'POST',
    path: 'granules/bulk',
    requestId: payload.requestId,
    body: payload.json
  }
});

export const deleteGranule = (granuleId) => ({
  [CALL_API]: {
    type: types.GRANULE_DELETE,
    method: 'DELETE',
    id: granuleId,
    path: `granules/${granuleId}`
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

export const searchGranules = (prefix) => ({ type: types.SEARCH_GRANULES, prefix: prefix });
export const clearGranulesSearch = () => ({ type: types.CLEAR_GRANULES_SEARCH });
export const filterGranules = (param) => ({ type: types.FILTER_GRANULES, param: param });
export const clearGranulesFilter = (paramKey) => ({ type: types.CLEAR_GRANULES_FILTER, paramKey: paramKey });

export const searchSubmissions = (prefix) => ({ type: types.SEARCH_SUBMISSIONS, prefix: prefix });
export const clearSubmissionsSearch = () => ({ type: types.CLEAR_SUBMISSIONS_SEARCH });
export const filterSubmissions = (param) => ({ type: types.FILTER_SUBMISSIONS, param: param });
export const clearSubmissionsFilter = (paramKey) => ({ type: types.CLEAR_SUBMISSIONS_FILTER, paramKey: paramKey });

export const getGranuleCSV = (options) => ({
  [CALL_API]: {
    type: types.GRANULE_CSV,
    method: 'GET',
    url: new URL('granule-csv', root).href
  }
});

export const getOptionsCollectionName = (options) => ({
  [CALL_API]: {
    type: types.OPTIONS_COLLECTIONNAME,
    method: 'GET',
    url: new URL('collections', root).href,
    qs: { limit: 100, fields: 'name,version' }
  }
});

export const getOptionsSubmissionName = (options) => ({
  [CALL_API]: {
    type: types.OPTIONS_SUBMISSIONNAME,
    method: 'GET',
    url: new URL('submissions', root).href,
    qs: { limit: 100, fields: 'name' }
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

export const listPdrs = (options) => {
  return (dispatch, getState) => {
    const timeFilters = fetchCurrentTimeFilters(getState().datepicker);
    return dispatch({
      [CALL_API]: {
        type: types.PDRS,
        method: 'GET',
        url: new URL('pdrs', root).href,
        qs: Object.assign({ limit: defaultPageLimit }, options, timeFilters)
      }
    });
  };
};

export const getPdr = (pdrName) => ({
  [CALL_API]: {
    id: pdrName,
    type: types.PDR,
    method: 'GET',
    path: `pdrs/${pdrName}`
  }
});

export const searchPdrs = (prefix) => ({ type: types.SEARCH_PDRS, prefix: prefix });
export const clearPdrsSearch = () => ({ type: types.CLEAR_PDRS_SEARCH });
export const filterPdrs = (param) => ({ type: types.FILTER_PDRS, param: param });
export const clearPdrsFilter = (paramKey) => ({ type: types.CLEAR_PDRS_FILTER, paramKey: paramKey });

export const listProviders = (options = {}) => {
  const { listAll = false, ...queryOptions } = options;
  return (dispatch, getState) => {
    const timeFilters = listAll ? {} : fetchCurrentTimeFilters(getState().datepicker);
    return dispatch({
      [CALL_API]: {
        type: types.PROVIDERS,
        method: 'GET',
        url: new URL('providers', root).href,
        qs: Object.assign({ limit: defaultPageLimit }, queryOptions, timeFilters)
      }
    });
  };
};

export const getOptionsProviderGroup = () => ({
  [CALL_API]: {
    type: types.OPTIONS_PROVIDERGROUP,
    method: 'GET',
    url: new URL('providers', root).href,
    qs: { limit: 100, fields: 'providerName' }
  }
});

export const getProvider = (providerId) => ({
  [CALL_API]: {
    type: types.PROVIDER,
    id: providerId,
    method: 'GET',
    path: `providers/${providerId}`
  }
});

export const createProvider = (providerId, payload) => ({
  [CALL_API]: {
    type: types.NEW_PROVIDER,
    id: providerId,
    method: 'POST',
    path: 'providers',
    body: payload
  }
});

export const updateProvider = (providerId, payload) => ({
  [CALL_API]: {
    type: types.UPDATE_PROVIDER,
    id: providerId,
    method: 'PUT',
    path: `providers/${providerId}`,
    body: payload
  }
});

export const clearUpdateProvider = (providerId) => ({ type: types.UPDATE_PROVIDER_CLEAR, id: providerId });

export const deleteProvider = (providerId) => ({
  [CALL_API]: {
    type: types.PROVIDER_DELETE,
    id: providerId,
    method: 'DELETE',
    path: `providers/${providerId}`
  }
});

export const searchProviders = (prefix) => ({ type: types.SEARCH_PROVIDERS, prefix: prefix });
export const clearProvidersSearch = () => ({ type: types.CLEAR_PROVIDERS_SEARCH });
export const filterProviders = (param) => ({ type: types.FILTER_PROVIDERS, param: param });
export const clearProvidersFilter = (paramKey) => ({ type: types.CLEAR_PROVIDERS_FILTER, paramKey: paramKey });

export const listForms = (options = {}) => {
  const { listAll = false, ...queryOptions } = options;
  return (dispatch, getState) => {
    const timeFilters = listAll ? {} : fetchCurrentTimeFilters(getState().datepicker);
    return dispatch({
      [CALL_API]: {
        type: types.FORMS,
        method: 'GET',
        url: new URL('forms', root).href,
        qs: Object.assign({ limit: defaultPageLimit }, queryOptions, timeFilters)
      }
    });
  };
};

export const getOptionsFormGroup = () => ({
  [CALL_API]: {
    type: types.OPTIONS_FORMGROUP,
    method: 'GET',
    url: new URL('forms', root).href,
    qs: { limit: 100, fields: 'formName' }
  }
});

export const getForm = (formId) => ({
  [CALL_API]: {
    type: types.FORM,
    id: formId,
    method: 'GET',
    path: `forms/${formId}`
  }
});

export const createForm = (formId, payload) => ({
  [CALL_API]: {
    type: types.NEW_FORM,
    id: formId,
    method: 'POST',
    path: 'forms',
    body: payload
  }
});

export const updateForm = (formId, payload) => ({
  [CALL_API]: {
    type: types.UPDATE_FORM,
    id: formId,
    method: 'PUT',
    path: `forms/${formId}`,
    body: payload
  }
});

export const clearUpdateForm = (formId) => ({ type: types.UPDATE_FORM_CLEAR, id: formId });

export const deleteForm = (formId) => ({
  [CALL_API]: {
    type: types.FORM_DELETE,
    id: formId,
    method: 'DELETE',
    path: `forms/${formId}`
  }
});

export const searchForms = (prefix) => ({ type: types.SEARCH_FORMS, prefix: prefix });
export const clearFormsSearch = () => ({ type: types.CLEAR_FORMS_SEARCH });
export const filterForms = (param) => ({ type: types.FILTER_FORMS, param: param });
export const clearFormsFilter = (paramKey) => ({ type: types.CLEAR_FORMS_FILTER, paramKey: paramKey });

export const listUsers = (options = {}) => {
  const { listAll = false, ...queryOptions } = options;
  return (dispatch, getState) => {
    const timeFilters = listAll ? {} : fetchCurrentTimeFilters(getState().datepicker);
    return dispatch({
      [CALL_API]: {
        type: types.USERS,
        method: 'GET',
        url: new URL('users', root).href,
        qs: Object.assign({ limit: defaultPageLimit }, queryOptions, timeFilters)
      }
    });
  };
};

export const getOptionsUserGroup = () => ({
  [CALL_API]: {
    type: types.OPTIONS_USERGROUP,
    method: 'GET',
    url: new URL('users', root).href,
    qs: { limit: 100, fields: 'userName' }
  }
});

export const getUser = (userId) => ({
  [CALL_API]: {
    type: types.USER,
    id: userId,
    method: 'GET',
    path: `users/${userId}`
  }
});

export const createUser = (userId, payload) => ({
  [CALL_API]: {
    type: types.NEW_USER,
    id: userId,
    method: 'POST',
    path: 'users',
    body: payload
  }
});

export const updateUser = (userId, payload) => ({
  [CALL_API]: {
    type: types.UPDATE_USER,
    id: userId,
    method: 'PUT',
    path: `users/${userId}`,
    body: payload
  }
});

export const clearUpdateUser = (userId) => ({ type: types.UPDATE_USER_CLEAR, id: userId });

export const deleteUser = (userId) => ({
  [CALL_API]: {
    type: types.USER_DELETE,
    id: userId,
    method: 'DELETE',
    path: `users/${userId}`
  }
});

export const searchUsers = (prefix) => ({ type: types.SEARCH_USERS, prefix: prefix });
export const clearUsersSearch = () => ({ type: types.CLEAR_USERS_SEARCH });
export const filterUsers = (param) => ({ type: types.FILTER_USERS, param: param });
export const clearUsersFilter = (paramKey) => ({ type: types.CLEAR_USERS_FILTER, paramKey: paramKey });

export const listGroups = (options = {}) => {
  const { listAll = false, ...queryOptions } = options;
  return (dispatch, getState) => {
    const timeFilters = listAll ? {} : fetchCurrentTimeFilters(getState().datepicker);
    return dispatch({
      [CALL_API]: {
        type: types.GROUPS,
        method: 'GET',
        url: new URL('groups', root).href,
        qs: Object.assign({ limit: defaultPageLimit }, queryOptions, timeFilters)
      }
    });
  };
};

export const getOptionsGroupGroup = () => ({
  [CALL_API]: {
    type: types.OPTIONS_GROUPGROUP,
    method: 'GET',
    url: new URL('groups', root).href,
    qs: { limit: 100, fields: 'groupName' }
  }
});

export const getGroup = (groupId) => ({
  [CALL_API]: {
    type: types.GROUP,
    id: groupId,
    method: 'GET',
    path: `groups/${groupId}`
  }
});

export const createGroup = (groupId, payload) => ({
  [CALL_API]: {
    type: types.NEW_GROUP,
    id: groupId,
    method: 'POST',
    path: 'groups',
    body: payload
  }
});

export const updateGroup = (groupId, payload) => ({
  [CALL_API]: {
    type: types.UPDATE_GROUP,
    id: groupId,
    method: 'PUT',
    path: `groups/${groupId}`,
    body: payload
  }
});

export const clearUpdateGroup = (groupId) => ({ type: types.UPDATE_GROUP_CLEAR, id: groupId });

export const deleteGroup = (groupId) => ({
  [CALL_API]: {
    type: types.GROUP_DELETE,
    id: groupId,
    method: 'DELETE',
    path: `groups/${groupId}`
  }
});

export const searchGroups = (prefix) => ({ type: types.SEARCH_GROUPS, prefix: prefix });
export const clearGroupsSearch = () => ({ type: types.CLEAR_GROUPS_SEARCH });
export const filterGroups = (param) => ({ type: types.FILTER_GROUPS, param: param });
export const clearGroupsFilter = (paramKey) => ({ type: types.CLEAR_GROUPS_FILTER, paramKey: paramKey });

export const deletePdr = (pdrName) => ({
  [CALL_API]: {
    type: types.PDR_DELETE,
    id: pdrName,
    method: 'DELETE',
    path: `pdrs/${pdrName}`
  }
});

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
    return dispatch(deleteToken())
      .then(() => dispatch({ type: types.LOGOUT }));
  };
};

export const login = (token) => ({
  [CALL_API]: {
    type: types.LOGIN,
    id: 'auth',
    method: 'GET',
    url: new URL('granules', root).href,
    qs: { limit: 1, fields: 'granuleId' },
    skipAuth: true,
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
});

export const deleteToken = () => {
  return (dispatch, getState) => {
    const token = getProperty(getState(), 'api.tokens.token');
    if (!token) return Promise.resolve();

    const requestConfig = configureRequest({
      method: 'DELETE',
      url: new URL(`tokenDelete/${token}`, root).href
    });
    return requestPromise(requestConfig)
      .finally(() => dispatch({ type: types.DELETE_TOKEN }));
  };
};

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
export const searchWorkflows = (searchString) => ({ type: types.SEARCH_WORKFLOWS, searchString });
export const clearWorkflowsSearch = () => ({ type: types.CLEAR_WORKFLOWS_SEARCH });

export const listMetrics = (options) => ({
  [CALL_API]: {
    type: types.METRICS,
    method: 'GET',
    url: new URL('metrics', root).href,
    qs: Object.assign({ limit: defaultPageLimit }, options)
  }
});
export const searchMetrics = (searchString) => ({ type: types.SEARCH_METRICS, searchString });
export const clearMetricsSearch = () => ({ type: types.CLEAR_METRICS_SEARCH });

export const searchExecutionEvents = (searchString) => ({ type: types.SEARCH_EXECUTION_EVENTS, searchString });
export const clearExecutionEventsSearch = () => ({ type: types.CLEAR_EXECUTION_EVENTS_SEARCH });

export const getExecutionStatus = (arn) => ({
  [CALL_API]: {
    type: types.EXECUTION_STATUS,
    method: 'GET',
    url: new URL('executions/status/' + arn, root).href
  }
});

export const getExecutionLogs = (executionName) => ({
  [CALL_API]: {
    type: types.EXECUTION_LOGS,
    method: 'GET',
    url: new URL('logs/' + executionName, root).href
  }
});

export const listExecutions = (options) => {
  return (dispatch, getState) => {
    const timeFilters = fetchCurrentTimeFilters(getState().datepicker);
    return dispatch({
      [CALL_API]: {
        type: types.EXECUTIONS,
        method: 'GET',
        url: new URL('executions', root).href,
        qs: Object.assign({ limit: defaultPageLimit }, options, timeFilters)
      }
    });
  };
};

export const filterExecutions = (param) => ({ type: types.FILTER_EXECUTIONS, param: param });
export const clearExecutionsFilter = (paramKey) => ({ type: types.CLEAR_EXECUTIONS_FILTER, paramKey: paramKey });
export const searchExecutions = (prefix) => ({ type: types.SEARCH_EXECUTIONS, prefix: prefix });
export const clearExecutionsSearch = () => ({ type: types.CLEAR_EXECUTIONS_SEARCH });

export const listOperations = (options) => {
  return (dispatch, getState) => {
    const timeFilters = fetchCurrentTimeFilters(getState().datepicker);
    return dispatch({
      [CALL_API]: {
        type: types.OPERATIONS,
        method: 'GET',
        url: new URL('asyncOperations', root).href,
        qs: Object.assign({ limit: defaultPageLimit }, options, timeFilters)
      }
    });
  };
};

export const getOperation = (operationId) => ({
  [CALL_API]: {
    type: types.OPERATION,
    id: operationId,
    method: 'GET',
    path: `asyncOperations/${operationId}`
  }
});

export const searchOperations = (prefix) => ({ type: types.SEARCH_OPERATIONS, prefix: prefix });
export const clearOperationsSearch = () => ({ type: types.CLEAR_OPERATIONS_SEARCH });
export const filterOperations = (param) => ({ type: types.FILTER_OPERATIONS, param: param });
export const clearOperationsFilter = (paramKey) => ({ type: types.CLEAR_OPERATIONS_FILTER, paramKey: paramKey });

export const listRules = (options) => {
  return (dispatch, getState) => {
    const timeFilters = fetchCurrentTimeFilters(getState().datepicker);
    return dispatch({
      [CALL_API]: {
        type: types.RULES,
        method: 'GET',
        url: new URL('rules', root).href,
        qs: Object.assign({ limit: defaultPageLimit }, options, timeFilters)
      }
    });
  };
};

export const getRule = (ruleName) => ({
  [CALL_API]: {
    id: ruleName,
    type: types.RULE,
    method: 'GET',
    path: `rules/${ruleName}`
  }
});

export const updateRule = (payload) => ({
  [CALL_API]: {
    id: payload.name,
    type: types.UPDATE_RULE,
    method: 'PUT',
    path: `rules/${payload.name}`,
    body: payload
  }
});

export const clearUpdateRule = (ruleName) => ({ type: types.UPDATE_RULE_CLEAR, id: ruleName });

export const createRule = (name, payload) => ({
  [CALL_API]: {
    id: name,
    type: types.NEW_RULE,
    method: 'POST',
    path: 'rules',
    body: payload
  }
});

export const deleteRule = (ruleName) => ({
  [CALL_API]: {
    id: ruleName,
    type: types.RULE_DELETE,
    method: 'DELETE',
    path: `rules/${ruleName}`
  }
});

export const enableRule = (payload) => {
  const rule = cloneDeep(payload);

  return {
    [CALL_API]: {
      id: rule.name,
      type: types.RULE_ENABLE,
      method: 'PUT',
      path: `rules/${rule.name}`,
      body: {
        ...rule,
        state: 'ENABLED'
      }
    }
  };
};

export const disableRule = (payload) => {
  const rule = cloneDeep(payload);

  return {
    [CALL_API]: {
      id: rule.name,
      type: types.RULE_DISABLE,
      method: 'PUT',
      path: `rules/${rule.name}`,
      body: {
        ...rule,
        state: 'DISABLED'
      }
    }
  };
};

export const rerunRule = (payload) => ({
  [CALL_API]: {
    id: payload.name,
    type: types.RULE_RERUN,
    method: 'PUT',
    path: `rules/${payload.name}`,
    body: {
      ...payload,
      action: 'rerun'
    }
  }
});

export const searchRules = (prefix) => ({ type: types.SEARCH_RULES, prefix: prefix });
export const clearRulesSearch = () => ({ type: types.CLEAR_RULES_SEARCH });
export const filterRules = (param) => ({ type: types.FILTER_RULES, param: param });
export const clearRulesFilter = (paramKey) => ({ type: types.CLEAR_RULES_FILTER, paramKey: paramKey });

export const listReconciliationReports = (options) => ({
  [CALL_API]: {
    type: types.RECONCILIATIONS,
    method: 'GET',
    url: new URL('reconciliationReports', root).href,
    qs: Object.assign({ limit: defaultPageLimit }, options)
  }
});

export const getReconciliationReport = (reconciliationName) => ({
  [CALL_API]: {
    id: reconciliationName,
    type: types.RECONCILIATION,
    method: 'GET',
    path: `reconciliationReports/${reconciliationName}`
  }
});

export const createReconciliationReport = () => ({
  [CALL_API]: {
    id: `reconciliation-report-${new Date().toISOString()}`,
    type: types.NEW_RECONCILIATION,
    method: 'POST',
    path: 'reconciliationReports'
  }
});

export const searchReconciliationReports = (prefix) => ({ type: types.SEARCH_RECONCILIATIONS, prefix: prefix });
export const clearReconciliationReportSearch = () => ({ type: types.CLEAR_RECONCILIATIONS_SEARCH });
