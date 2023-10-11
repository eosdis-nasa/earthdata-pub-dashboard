'use strict';

import React from 'react';
import { connect } from 'react-redux';
import withQueryParams from 'react-router-query-params';
import { withRouter } from 'react-router-dom';
import { login, fetchToken2, redirectWithToken, associate, verify } from '../../actions';
import PropTypes from 'prop-types';
import LoadingOverlay from '../LoadingIndicator/loading-overlay';
import ErrorReport from '../Errors/report';
import Header from '../Header/header';
import Modal from 'react-bootstrap/Modal';
import QRCode from 'react-qr-code';
import config from '../../config';
import ourConfigureStore from '../../store/configureStore';

class Auth extends React.Component {
  constructor(props) {
    super(props);
    this.store = ourConfigureStore({});
    this.state = { associated: false, verified: false, body: '', mfa_enabled: false };
    this.clickLogin = this.clickLogin.bind(this);
    this.callAssociate = this.callAssociate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async callAssociate() {
    const { dispatch, api } = this.props;
    const { tokens } = api;
    let secretCode = '';
    if (config.environment.match(/LOCALHOST/g)) {
      secretCode = 'somefakesecretcode'
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
          this.setState({ body: this.renderQrCode(secretCode), associated: true });
        }
      })
    }
  };

  async handleSubmit() {
    const { api, dispatch, queryParams } = this.props;
    const { inflight, tokens } = api;
    const { code, redirect } = queryParams;
    if (this.state.associated && tokens.token!== null && !this.state.verified && document.getElementById('totp')?.value !== '') {
      dispatch(verify(document.getElementById('totp').value, tokens.token)).then(value => {
        const resp = value;
        let error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error || resp?.message
        if (error && !config.environment.match(/LOCALHOST/g)) {
          console.log(`An error has occurred: ${error}.`);
        } else {
          let new_user = { ...tokens.user };
          new_user.mfa_enabled = true;
          window.localStorage.removeItem('auth-user');
          window.localStorage.setItem('auth-user', JSON.stringify(new_user))
          this.setState({ verified: true, mfa_enabled: true, body: '', authenticated: true});
          if (!inflight && code) {
            window.location.href = config.basepath;
          } 
        }
      })
    } 
  }

  async componentDidMount () {
    console.log('compoennt did mount')
    const { dispatch, api, queryParams } = this.props;
    const { authenticated, inflight, tokens } = api;
    const { code, state, redirect } = queryParams;
    if (window.localStorage.getItem('auth-user') !== null && window.localStorage.getItem('auth-user').mfa_enabled !== this.state.mfa_enabled) {
      this.setState({ mfa_enabled: window.localStorage.getItem('auth-user').mfa_enabled });
    }
    if (tokens.token === null && !inflight && code) {
      const { data } = await dispatch(fetchToken2(code, state))
      const { token } = data;
      window.localStorage.setItem('auth-token', token);
    }
    if (authenticated || this.state.mfa_enabled) {
      console.log('auth?2', this.store.getState().api.authenticated)
      window.location.href = config.basepath;
      // redirectWithToken(redirect || 'dashboard', tokens.token);
    } else if (code && !this.state.associated && !this.state.verified && !this.state.mfa_enabled) {
      console.log('calling associate from did mount')
      this.callAssociate()
    }
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
                {(!showLoginButton && this.state.body == '') || showAuthMessage ? 
                  <div><LoadingOverlay/></div> : null}
                {showAuthMessage &&
                  <div>
                    <h2 className='heading--medium'>
                      Authenticating...
                    </h2>
                  </div>
                }
                {api.error && <ErrorReport report={api.error} />}
                {this.state.body !== '' ? this.state.body : null}
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
