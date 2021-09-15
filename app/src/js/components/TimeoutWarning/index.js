import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Modal from 'react-bootstrap/Modal';
import { logout, refreshToken } from '../../actions';

class TimeoutWarning extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      show: false,
      remaining: 30
    };
    this.startCountdown = this.startCountdown.bind(this);
    this.updateRemaining = this.updateRemaining.bind(this);
  }

  componentDidMount () {
    this.setWarningTimeout();
  }

  componentWillUnmount () {
    clearInterval(this.interval);
    clearTimeout(this.timeout);
  }

  componentDidUpdate (prevProps) {
    if (this.props.api.tokens.expiration !== prevProps.api.tokens.expiration) {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.setWarningTimeout();
    }
  }

  setWarningTimeout () {
    const sessionLength = this.props.api.tokens.expiration - Date.now() - 30000;
    this.timeout = setTimeout(this.startCountdown.bind(this), sessionLength);
  }

  startCountdown () {
    this.setState({ show: true });
    this.interval = setInterval(this.updateRemaining.bind(this), 1000);
  }

  updateRemaining () {
    const remaining = parseInt((this.props.api.tokens.expiration - Date.now()) / 1000);
    if (remaining < 0) {
      this.logoutNow();
    } else {
      this.setState({ remaining });
    }
  }

  extendSession () {
    clearInterval(this.interval);
    clearTimeout(this.timeout);
    this.timeout = null;
    this.interval = null;
    this.setState({ show: false });
    this.props.dispatch(refreshToken());
  }

  logoutNow () {
    clearInterval(this.interval);
    clearTimeout(this.timeout);
    this.timeout = null;
    this.interval = null;
    this.props.dispatch(logout());
  }

  render () {
    return (
      <Modal show={this.state.show} backdrop="static" keyboard={false} centered={true}>
        <Modal.Header closeButton>
          <Modal.Title>Session Expiring</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            Your session will expire in {this.state.remaining} seconds.
        </Modal.Body>
        <Modal.Footer>
          <button
            className={'button button__animation--md'}
            onClick={this.extendSession.bind(this)}>Extend Session</button>
          <button
            className={'button button__animation--md button--secondary button__cancel'}
            onClick={() => this.props.dispatch(logout())}>Logout Now</button>
        </Modal.Footer>
      </Modal>
    );
  }
}

TimeoutWarning.propTypes = {
  api: PropTypes.object,
  dispatch: PropTypes.object
};

export default connect(state => ({
  api: state.api
}))(TimeoutWarning);
