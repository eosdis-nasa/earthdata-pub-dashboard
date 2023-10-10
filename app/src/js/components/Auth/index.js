'use strict';

import React from 'react';
import { connect } from 'react-redux';
import withQueryParams from 'react-router-query-params';
import { withRouter } from 'react-router-dom';
import { login, fetchToken, redirectWithToken, associate, verify } from '../../actions';
import PropTypes from 'prop-types';
import LoadingOverlay from '../LoadingIndicator/loading-overlay';
import ErrorReport from '../Errors/report';
import Header from '../Header/header';
import Modal from 'react-bootstrap/Modal';
import QRCode from 'react-qr-code';
import config from '../../config';

class Auth extends React.Component {
  constructor(props) {
    super(props);
    this.state = { associated: false, verified: false, body: '', mfa_enabled: false };
    this.clickLogin = this.clickLogin.bind(this);
    this.callAssociate = this.callAssociate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidUpdate () {
    const { dispatch, api, queryParams } = this.props;
    const { code, state, redirect } = queryParams;
    const { authenticated, inflight, tokens } = api;
    if (tokens?.user?.mfa_enabled !== this.state.mfa_enabled && !config.environment.match(/LOCALHOST/g) && tokens?.user?.mfa_enabled !== undefined) {
      this.setState({ mfa_enabled: tokens.user.mfa_enabled });
      console.log('reset to ' + this.state.mfa_enabled)
    }
    if (authenticated && this.state.mfa_enabled) {
      console.log('component did update authenticated, redirecting')
      redirectWithToken(state, tokens.token);
    } else if (code && !this.state.associated && !this.state.verified && !this.state.mfa_enabled) {
      console.log('calling associate from did update')
      this.callAssociate()
    }
  }

  async callAssociate() {
    const { dispatch, api, queryParams } = this.props;
    let { tokens, inflight } = api;
    const { code, state } = queryParams;
    let secretCode = '';
    if (config.environment.match(/LOCALHOST/g)) {
      tokens = {};
      tokens.token = 'somefaketoken';
      secretCode = 'somefakesecretcode'
    } 
    if (tokens.token === null && !inflight && code) {
      dispatch(fetchToken(code, state));
    }
    if (tokens.token !== null && !this.state.associated) {
      await dispatch(associate(tokens.token)).then(value => {
        let resp = value
        let error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error || resp?.message
        if (!config.environment.match(/LOCALHOST/g)) {
          secretCode = resp.data.SecretCode
        }
        if (error && !config.environment.match(/LOCALHOST/g)) {
          console.log(`An error has occurred: ${error}.`);
        } else {
          this.setState({ body: this.renderQrCode(secretCode) });
          this.setState({ associated: true });
        }
      })
    }
  };

  async handleSubmit() {
    const { api, dispatch, queryParams } = this.props;
    const { authenticated, inflight } = api;
    const { redirect, code } = queryParams;
    let { tokens } = api;
    if (config.environment.match(/LOCALHOST/g)) {
      tokens = {};
      tokens.token = 'somefaketoken';
    }
    if (this.state.associated && tokens.token!== null && !this.state.verified && document.getElementById('totp')?.value !== '') {
      dispatch(verify(document.getElementById('totp').value, tokens.token)).then(value => {
        const resp = value;
        let error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error || resp?.message
        if (error && !config.environment.match(/LOCALHOST/g)) {
          console.log(`An error has occurred: ${error}.`);
        } else {
          this.setState({ verified: true });
          this.setState({ mfa_enabled: true });
          this.setState({ body: '' });
          console.log('verified', this.state.associated, this.state.verified, this.state.mfa_enabled, inflight, authenticated, code)
          if (this.state.associated && this.state.verified && this.state.mfa_enabled && !inflight && code) {
            redirectWithToken(redirect || 'dashboard', tokens.token);
          } 
        }
      })
    } 
  }

  async componentDidMount () {
    const { dispatch, api, queryParams } = this.props;
    const { authenticated, inflight, tokens } = api;
    const { code, state, redirect } = queryParams;
    if (tokens?.user?.mfa_enabled !== this.state.mfa_enabled && !config.environment.match(/LOCALHOST/g) && tokens?.user?.mfa_enabled !== undefined) {
      this.setState({ mfa_enabled: tokens.user.mfa_enabled });
      console.log('(mounted) reset to ' + this.state.mfa_enabled)
    }
    if (authenticated && this.state.mfa_enabled) {
      console.log('redirecting with token')
      redirectWithToken(redirect || 'dashboard', tokens.token);
    } else if (!inflight) {
      if (code) {
        console.log('getting token')
        // dispatch(fetchToken(code, state));
      }
    }
    /* if (authenticated) {
      console.log('component did mount authenticated')
      redirectWithToken(redirect || 'dashboard', tokens.token);
    } else if (!inflight && this.state.mfa_enabled) {
      if (code) {
        console.log('component did mount fetching token')
        dispatch(fetchToken(code, state));
      }
    } else if (authenticated && !this.state.associated) {
      console.log('calling associate from did mount', authenticated, this.state.associated, this.state.verified, code, inflight, this.state.mfa_enabled)
      this.callAssociate()
    } */
  }

  clickLogin () {
    const { dispatch, queryParams } = this.props;
    const { redirect } = queryParams;
    dispatch(login(redirect || 'dashboard'));
  }

  renderQrCode (string) {
    let otpPath = string;
    let setupCode = string;
    if(typeof(string) !=='string'){
      otpPath='someteststring'
      setupCode = 'someteststring'
    }
    return (
      <div style={{ textAlign: 'left' }}>
        <div className="eui-info-box">
          <p>
            Time-based One Time Password (TOTP) is the mechanism that Google Authenticator, Authy, Microsoft Authenticator, FreeOTP
            Authenticator and other two-factor authentication apps use to generate short-lived authentication codes.
          </p>
          <p style={{ marginTop: '1rem' }}>Please download one of the TOTP apps to your device to scan the QR code  or enter the setup code provided below.</p>
        </div>
        <div className="totpSetup">
          <div>
            Please scan the QR code with your mobile device or use the setup code provided in your TOTP app, and enter the Time-based One-Time Password(TOTP) below.
          </div>
          <div style={{ height: 'auto', margin: '0 auto', maxWidth: 64, width: '100%' }}>
            <QRCode
              size={300}
              style={{ height: 'auto', maxWidth: '100%', width: '100%', marginTop: '2rem' }}
              value={otpPath}
              viewBox={'0 0 300 300'}
            />
          </div>
          <div id="secretcode" style={{ marginTop: '2rem' }}>Setup Code: <strong style={{wordBreak:'break-all'}}>{setupCode}</strong></div>
          <input type="hidden" id="secret" name="secret" value={otpPath} />
          <br />
          <p>
            <label htmlFor="totp">Enter Authentication Code from Verification App </label>
            <br />
            <input type="text" name="totp" id="totp" autoFocus="autofocus" className="default" style={{ width: '20%' }} />
          </p>
          <p style={{ marginTop: '1rem' }}>
            <button className={'button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'}
              aria-label="submit your user" data-disable-with="TOTP" onClick={this.handleSubmit}>
              Submit
            </button>
          </p>
        </div>
      </div>
    );
  }

  render () {
    const { dispatch, api, apiVersion, queryParams } = this.props;
    const { code, token } = queryParams;
    const showLoginButton = !api.authenticated && !api.inflight && !code && !token && !this.state.associated;
    const showAuthMessage = (api.inflight || code || token) && this.state.mfa_enabled;
    return (
      <div className='app'>
        <Header dispatch={dispatch} api={api} apiVersion={apiVersion} minimal={true} />
        <main className='main' role='main'>
          <div className="modal-content">
            <Modal
              dialogClassName="oauth-modal"
              show={true}
              centered
              size="sm"
              aria-labelledby="modal__oauth-modal"
            >
              <Modal.Header className="oauth-modal__header"></Modal.Header>
              <Modal.Title id="modal__oauth-modal" className="oauth-modal__title">Welcome To Earthdata Pub Dashboard</Modal.Title>
              <Modal.Body>
                {showAuthMessage &&
                  <><LoadingOverlay />
                    <div>
                      <h2 className='heading--medium'>
                        Authenticating...
                      </h2>
                    </div></>
                }
                {api.error && <ErrorReport report={api.error} />}
                {this.state.body ? this.state.body : null}
              </Modal.Body>
              <Modal.Footer>
                {showLoginButton &&
                  <button className="button button--oauth" onClick={this.clickLogin}>Login to Earthdata Pub</button>
                }
              </Modal.Footer>
            </Modal>
          </div>
        </main>
      </div>
    );
  }
}

Auth.propTypes = {
  dispatch: PropTypes.func,
  api: PropTypes.object,
  location: PropTypes.object,
  history: PropTypes.object,
  apiVersion: PropTypes.object,
  queryParams: PropTypes.object
};

export default withRouter(withQueryParams()(connect(state => state)(Auth)));
