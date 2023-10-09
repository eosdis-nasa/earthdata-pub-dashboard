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
    console.log('component did update', authenticated, this.state.mfa_enabled, tokens.user.mfa_enabled, this.state.associated, this.state.verified)
    // false, false, true, false .. right after login with a state of dashboard and with a code

    // false, false, true, true .. right after submit after successful verification with state of dashboard and with a code

    // true, false, true, false .. redirects to the page and shouldn't
    // if (!tokens.user.mfa_enabled && !this.state.associated) {
    if (!this.state.mfa_enabled && !this.state.associated) {
      this.callAssociate();
    } else if (authenticated && this.state.mfa_enabled) {
      redirectWithToken(redirect || 'dashboard', tokens.token);
    } else if (!inflight) {
      if (code && this.state.mfa_enabled) {
        dispatch(fetchToken(code, state));
      }
    }
  }

  async handleSubmit() {
    const { api, queryParams } = this.props;
    const { authenticated, inflight, tokens } = api;
    const { redirect } = queryParams;
    if (this.state.associated && !this.state.verified && document.getElementById('totp')?.value !== '') {
      const resp = verify(document.getElementById('totp').value, tokens.token);
      let error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error
      if (error) {
        console.log(`An error has occurred: ${error}.`);
      } else {
        this.setState({ verified: true });
        this.setState({ body: '' });
        this.setState({ mfa_enabled: true });
        console.log(this.state.associated, this.state.verified, inflight, redirect, this.state.mfa_enabled, tokens.user.mfa_enabled)
        if ((this.state.associated && this.state.verified && !inflight) || authenticated) {
          redirectWithToken(redirect || 'dashboard', tokens.token);
        } 
      }
    } 
  }

  componentDidMount () {
    const { dispatch, api, queryParams } = this.props;
    const { authenticated, inflight, tokens } = api;
    console.log('component did mount', authenticated, tokens.token)
    const { code, state, redirect } = queryParams;
    // if (!tokens.user.mfa_enabled && !this.state.associated) {
    if (!this.state.mfa_enabled && !this.state.associated) {
      this.callAssociate();
    } else if (authenticated && this.state.mfa_enabled) {
      redirectWithToken(redirect || 'dashboard', tokens.token);
    } else if (!inflight) {
      if (code) {
        dispatch(fetchToken(code, state));
      }
    }
  }

  async callAssociate(){
    const { api } = this.props;
    const { tokens } = api;
    console.log('tokens', tokens.token)
    const resp = associate(tokens.token);
    console.log('resp from associate', tokens.token, resp)
    /* {
      "message": "Local placeholder for associate MFA function."
    } */
    let error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error
    if (error) {
      console.log(`An error has occurred: ${error}.`);
    } else {
      this.setState({ associated: true });
      this.setState({ body: this.renderQrCode(resp.message) });
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
          <div id="secretcode" className="eui-info-box" style={{ marginTop: '2rem' }}>Setup Code: <strong>{setupCode}</strong></div>
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
    const { tokens } = api;
    // const mfaEnabled = api.tokens.user.mfa_enabled;
    let mfaEnabled = this.state.mfa_enabled;
    console.log('mfaEnabled', this.state.mfa_enabled, tokens.user.mfa_enabled)
    const showLoginButton = !api.authenticated && !api.inflight && !code && !token;
    const showAuthMessage = api.inflight || token || this.state.verified;
    return (
      <div className='app'>
        <Header dispatch={dispatch} api={api} apiVersion={apiVersion} minimal={true}/>
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
                { showAuthMessage &&
                  <><LoadingOverlay />
                  <div>
                    <h2 className='heading--medium'>
                      Authenticating...
                    </h2>
                  </div></>
                }
                { api.error && <ErrorReport report={api.error} /> }
                { !mfaEnabled && !showLoginButton ? this.state.body : null}
              </Modal.Body>
              <Modal.Footer>
                { showLoginButton &&
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
