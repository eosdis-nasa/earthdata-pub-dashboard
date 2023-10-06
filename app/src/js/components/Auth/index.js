'use strict';

import React from 'react';
import { connect } from 'react-redux';
import withQueryParams from 'react-router-query-params';
import { withRouter } from 'react-router-dom';
import { login, fetchToken, redirectWithToken } from '../../actions';
import PropTypes from 'prop-types';
import LoadingOverlay from '../LoadingIndicator/loading-overlay';
import ErrorReport from '../Errors/report';
import Header from '../Header/header';
import Modal from 'react-bootstrap/Modal';
import QRCode from 'react-qr-code';

class Auth extends React.Component {
  constructor () {
    super();
    this.clickLogin = this.clickLogin.bind(this);
  }

  componentDidUpdate () {
    const { api, queryParams } = this.props;
    const { state } = queryParams;
    const { authenticated, tokens } = api;
    if (authenticated && !tokens.user.mfa_enabled) {
      this.renderQrCode();
    } else if (authenticated) {
      redirectWithToken(state, tokens.token);
    }
  }

  componentDidMount () {
    const { dispatch, api, queryParams } = this.props;
    const { authenticated, inflight, tokens } = api;
    const { code, state, redirect } = queryParams;
    if (authenticated && !tokens.user.mfa_enabled) {
      this.renderQrCode();
    } else if (authenticated) {
      redirectWithToken(redirect || 'dashboard', tokens.token);
    } else if (!inflight) {
      if (code) {
        dispatch(fetchToken(code, state));
      }
    }
  }

  clickLogin () {
    const { dispatch, queryParams } = this.props;
    const { redirect } = queryParams;
    dispatch(login(redirect || 'dashboard'));
  }

  renderQrCode () {
    const otpPath = 'https://testsigma.com';
    const setupCode = 'https://testsigma.com';
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
          <form id="setuptotp" action="/totp/setup" acceptCharset="UTF-8" method="post">
            <p>
              <label htmlFor="totp">Enter Authentication Code from Verification App </label>
              <br />
              <input type="text" name="totp" id="totp" autoFocus="autofocus" className="default" style={{ width: '20%' }} />
            </p>
            <p style={{ marginTop: '1rem' }}>
              { /* <input type="submit" name="commit" value="SUBMIT" className={'button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'} data-disable-with="TOTP" /> */}
              <button value="SUBMIT" className={'button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'}
                aria-label="submit your user" data-disable-with="TOTP">
                Submit
              </button>
            </p>
          </form>
        </div>
      </div>
    );
  }

  render () {
    const { dispatch, api, apiVersion, queryParams } = this.props;
    const { code, token } = queryParams;
    const mfaEnabled = api.tokens.user.mfa_enabled;
    const showLoginButton = !api.authenticated && !api.inflight && !code && !token && !mfaEnabled;
    const showAuthMessage = api.inflight || code || token;
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
                  <><LoadingOverlay /><div>
                    <h2 className='heading--medium'>
                      Authenticating...
                    </h2>
                  </div></>
                }
                {!mfaEnabled ? this.renderQrCode() : null }
                { api.error && <ErrorReport report={api.error} /> }
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
