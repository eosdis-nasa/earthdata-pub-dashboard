import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Modal from 'react-bootstrap/Modal';
import { refreshToken } from '../../actions';
import _config from '../../config/config';
import { history } from '../../store/configureStore';


const { logoutUrl, cognitoClientLogoutUrl } = _config;
const post_logout_redirect_uri = encodeURIComponent(cognitoClientLogoutUrl);
const logoutUrlWithRedirect = `${logoutUrl}${post_logout_redirect_uri ? `&post_logout_redirect_uri=${post_logout_redirect_uri}` : ''}`;

class TimeoutWarning extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      show: false,
      remaining: 0
    };
    this.startCountdown = this.startCountdown.bind(this);
    this.updateRemaining = this.updateRemaining.bind(this);
  }

  componentDidMount () {
    this.setWarningTimeout();
  }

  componentWillUnmount () {
    this.clearTimers();
  }

  componentDidUpdate (prevProps) {
    if (this.props.api.tokens.token !== prevProps.api.tokens.token) {
      this.clearTimers();
      this.setWarningTimeout();
    }
  }

  setWarningTimeout () {
    const tokens = this.props.api.tokens;
    if (tokens.token && !tokens.inflight) {
      const currentTime = Math.floor(Date.now() / 1000);
      const sessionLength = tokens.expiration - currentTime;
      const warningTime = (sessionLength - 30) * 1000;
      this.timeout = setTimeout(this.startCountdown.bind(this), warningTime);
    }
  }

  startCountdown () {
    this.updateRemaining();
    this.interval = setInterval(this.updateRemaining.bind(this), 1000);
    this.setState({ show: true });
  }

  updateRemaining () {
    const currentTime = Math.floor(Date.now() / 1000);
    const remaining = parseInt(this.props.api.tokens.expiration - currentTime);
    if (remaining < 0) {
      this.logoutNow();
      history.push('/clear-cache');
    } else {
      this.setState({ remaining });
    }
  }

  clearTimers () {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  extendSession () {
    this.setState({ show: false });
    this.clearTimers();
    this.props.dispatch(refreshToken());
  }

  logoutNow () {
    this.setState({ show: false });
    this.clearTimers();
  }

  render () {
    const tokens = this.props.api.tokens;
    return (
      <Modal
        show={this.state.show}
        backdrop="static"
        keyboard={false}
        centered={true}
        aria-labelledby="modal__timeout-modal">
        <Modal.Header closeButton>
          <Modal.Title>Session Expiring</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {tokens.inflight
            ? <div>Refreshing...</div>
            : <div>Your session will expire in {this.state.remaining} seconds.</div>
          }
        </Modal.Body>
        <Modal.Footer>
          <button
            className={'button button__animation--md'}
            onClick={this.extendSession.bind(this)}
            disabled={tokens.inflight}>Extend Session</button>
          <a href={logoutUrlWithRedirect} aria-label="Logout" className='link--no-underline'>
            <button
              className={'button button__animation--md button--secondary button__cancel'}
              onClick={() => this.logoutNow}
              disabled={tokens.inflight}>Logout Now</button>
          </a>
        </Modal.Footer>
      </Modal>
    );
  }
}

TimeoutWarning.propTypes = {
  api: PropTypes.object,
  dispatch: PropTypes.func
};

export default connect(state => ({
  api: state.api
}))(TimeoutWarning);
