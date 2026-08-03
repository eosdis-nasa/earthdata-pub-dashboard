import requestPromise from 'request-promise';

import { loginError } from '../actions';
import { CALL_API } from '../actions/types';
import {
  configureRequest,
  addRequestAuthorization,
  getErrorMessage
} from '../actions/helpers';
import log from '../utils/log';
import { isValidApiRequestAction } from './validate';
import Error from '../components/error';
import { history } from '../store/configureStore';

const isAuthFailureMessage = (message = '') => (
  message.includes('Your session has expired. Please login again.') ||
  message.includes('Invalid Authorization token') ||
  message.includes('Access token has expired')
);

const handleError = ({ id, type, error, requestAction }, { dispatch, getState, next }) => {
  console.groupCollapsed('handleError');
  console.log(`id: ${id}`);
  console.log(`type: ${type}`);
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

    // Invalid IDFS/auth key (or expired access token) while EDPub session may still be present.
    // Show notification modal before signing out — do not hard-redirect here.
    if (isAuthFailureMessage(error.message)) {
      dispatch(loginError(error.message.replace('Bad Request: ', '')));
      return;
    }
  }

  const errorType = type + '_ERROR';
  log((id ? errorType + ': ' + id : errorType));
  log(error);

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
        const errorCode = response?.error?.code || 200
        if(errorCode !== 200){
            const redirectUrl = new URL(`${window.location.origin}/error`);
            window.location.href=redirectUrl
        }
        const { body } = response;
        if (+response.statusCode >= 400) {
          const error = new Error(getErrorMessage(response));
          return handleError({ id, type, error, requestAction }, { dispatch, getState, next });
        }

        const duration = new Date() - start;
        log((id ? type + ': ' + id : type), duration + 'ms');
        return next({ id, type, data: body, config: requestAction });
      })
      .catch((error) => handleError({ id, type, error, requestAction }, { dispatch, getState, next }));
  }
  return next(action);
};
