import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { checkIdfsSession } from '../../actions';

const IDFS_SESSION_CHECK_MS = 300000; // 5 minutes — same cadence as form draft autosave

/**
 * Periodically probes GET /api/auth/idfssession while the user is authenticated.
 * Failures are handled by request middleware (auth-invalid modal).
 * Does not call token/refresh — Extend Session remains separate.
 */
class IdfsSessionCheck extends React.Component {
  componentDidMount () {
    this.startPolling();
  }

  componentDidUpdate (prevProps) {
    const wasAuth = prevProps.api.authenticated && prevProps.api.tokens.token;
    const isAuth = this.props.api.authenticated && this.props.api.tokens.token;
    if (wasAuth !== isAuth || prevProps.api.tokens.token !== this.props.api.tokens.token) {
      this.clearPolling();
      this.startPolling();
    }
  }

  componentWillUnmount () {
    this.clearPolling();
  }

  startPolling () {
    const { api, dispatch } = this.props;
    if (!api.authenticated || !api.tokens.token || api.authInvalidNotification) {
      return;
    }
    // Immediate check on mount / login, then every 5 minutes.
    // Always catch — request middleware returns a Promise; an unhandled
    // rejection (e.g. CORS while API is down) shows the webpack overlay.
    const runCheck = () => {
      Promise.resolve(dispatch(checkIdfsSession())).catch(() => {});
    };
    runCheck();
    this.interval = setInterval(() => {
      const { api: currentApi } = this.props;
      if (
        currentApi.authenticated &&
        currentApi.tokens.token &&
        !currentApi.authInvalidNotification
      ) {
        runCheck();
      }
    }, IDFS_SESSION_CHECK_MS);
  }

  clearPolling () {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  render () {
    return null;
  }
}

IdfsSessionCheck.propTypes = {
  api: PropTypes.object,
  dispatch: PropTypes.func
};

export default connect(state => ({
  api: state.api
}))(IdfsSessionCheck);
