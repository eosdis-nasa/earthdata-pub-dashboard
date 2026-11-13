import requestPromise from 'request-promise';

import { CALL_API, LOGIN_ERROR } from '../actions/types';
import {
  configureRequest,
  addRequestAuthorization,
  getErrorMessage
} from '../actions/helpers';
import log from '../utils/log';
import { createErrorReferenceId, isReferenceId } from '../utils/feedback';
import { isValidApiRequestAction } from './validate';
import { history } from '../store/configureStore';
import _config from '../config';

function appBase () {
  const basepath = _config.basepath || '/';
  if (!basepath || basepath === '/') return '';
  return String(basepath).replace(/\/$/, '');
}

function referenceFromResponse (response) {
  const body = response && response.body;
  const error = body && body.error;
  const candidates = [
    body && body.referenceId,
    error && typeof error === 'object' && error.referenceId,
    response && response.error && response.error.referenceId
  ];
  return candidates.find((value) => isReferenceId(value)) || '';
}

function errorCodeFromResponse (response) {
  const body = response && response.body;
  const bodyError = body && body.error;
  const code = (response && response.error && response.error.code)
    || (bodyError && typeof bodyError === 'object' && bodyError.code);
  const parsed = Number(code);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pageToReport () {
  const page = window.location.pathname;
  if (typeof page !== 'string' || !page.startsWith('/') || page.length > 200) return '';
  if (/[?#\s]/.test(page) || page === '/error' || page === `${appBase()}/error`) return '';
  return page;
}

function sendToErrorPage (referenceId) {
  const redirectUrl = new URL(`${window.location.origin}${appBase()}/error`);
  redirectUrl.searchParams.set('ref', referenceId);
  const page = pageToReport();
  if (page) redirectUrl.searchParams.set('from', page);
  window.location.assign(redirectUrl.toString());
}

const isAuthFailureMessage = (message = '') => (
  message.includes('Your session has expired. Please login again.') ||
  message.includes('Invalid Authorization token') ||
  message.includes('Access token has expired') ||
  // API Gateway / IDFS OIDC authorizer returns this when the auth key is invalid
  message.includes('Unauthorized') ||
  message.toLowerCase().includes('unauthorized')
);

const isAuthFailure = (error, statusCode) => {
  if (statusCode === 401) return true;
  if (error?.message && isAuthFailureMessage(error.message)) return true;
  // Local authorizer uses a bare 403 with little/no body
  if (statusCode === 403) {
    const message = error?.message || '';
    return !message || message === 'Forbidden' || isAuthFailureMessage(message);
  }
  return false;
};

const showAuthInvalidModal = (dispatch, getState, error) => {
  if (getState().api.authInvalidNotification) {
    return;
  }
  const message = (error?.message || 'Your authentication credentials are no longer valid.')
    .replace('Bad Request: ', '');
  dispatch({ type: LOGIN_ERROR, error: message });
};

const handleError = ({ id, type, error, requestAction, statusCode }, { dispatch, getState, next }) => {
  console.groupCollapsed('handleError');
  console.log(`id: ${id}`);
  console.log(`type: ${type}`);
  console.log(`statusCode: ${statusCode}`);
  console.dir(error);
  console.dir(requestAction);
  console.groupEnd();

  if (error.message) {
    // Temporary fix until the 'logs' endpoint is fixed
    // TODO: is this still relevant?
    if (error.message.includes('Invalid Authorization token') &&
        requestAction.url.includes('logs')) {
      const data = { results: [] };
      return next({ id, type, data, config: requestAction });
    }
  }

  // Invalid IDFS/auth key while EDPub session may still be present.
  // Show notification modal before signing out — do not hard-redirect here.
  if (isAuthFailure(error, statusCode)) {
    showAuthInvalidModal(dispatch, getState, error);
    return;
  }

  const errorType = type + '_ERROR';
  log((id ? errorType + ': ' + id : errorType));
  log(error);

  // IDFS probe: only auth failures should interrupt the user (CORS/404/network must not logout).
  if (type === 'CHECK_IDFS_SESSION') {
    return next({
      id,
      config: requestAction,
      type: errorType,
      error: error.message || 'IDFS session check failed'
    });
  }

  // Preserve original auto-logout for non-auth API errors, but do not interrupt
  // an in-progress auth-invalid notification modal.
  if (localStorage.getItem('auth-token') && !getState().api.authInvalidNotification) {
    history.push('/logout');
  }

  return next({
    id,
    config: requestAction,
    type: errorType,
    error: 'An internal error occurred. If the error continues, reach out to the EDPub development team.'
  });
};

export const requestMiddleware = ({ dispatch, getState }) => next => action => {
  if (isValidApiRequestAction(action)) {
    let requestAction = action[CALL_API];

    if (!requestAction.method) {
      throw new Error('Request action must include a method');
    }

    requestAction = configureRequest(requestAction);
    if (!requestAction.skipAuth) {
      addRequestAuthorization(requestAction, getState());
    }

    const { id, type } = requestAction;

    const inflightType = type + '_INFLIGHT';
    log((id ? inflightType + ': ' + id : inflightType));
    dispatch({ id, config: requestAction, type: inflightType });

    const start = new Date();
    return requestPromise(requestAction)
      .then((response) => {
        const statusCode = +response.statusCode;
        const errorCode = errorCodeFromResponse(response);
        if (statusCode >= 500 || errorCode >= 500) {
          sendToErrorPage(referenceFromResponse(response) || createErrorReferenceId());
          return;
        }
        const { body } = response;
        if (+response.statusCode >= 400) {
          const error = new Error(getErrorMessage(response));
          return handleError(
            { id, type, error, requestAction, statusCode: +response.statusCode },
            { dispatch, getState, next }
          );
        }

        const duration = new Date() - start;
        log((id ? type + ': ' + id : type), duration + 'ms');
        return next({ id, type, data: body, config: requestAction });
      })
      .catch((error) => handleError(
        { id, type, error, requestAction, statusCode: error?.statusCode },
        { dispatch, getState, next }
      ));
  }
  return next(action);
};
