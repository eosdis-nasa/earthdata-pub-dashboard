'use strict';

import React from 'react';
import { connect } from 'react-redux';
import withQueryParams from 'react-router-query-params';
import { withRouter } from 'react-router-dom';
import { login, mfaTokenFetch, redirectWithToken, verify } from '../../actions';
import PropTypes from 'prop-types';
import LoadingOverlay from '../LoadingIndicator/loading-overlay';
import ErrorReport from '../Errors/report';
import Header from '../Header/header';
import Modal from 'react-bootstrap/Modal';
import QRCode from 'react-qr-code';
import config from '../../config';
import ourConfigureStore from '../../store/configureStore';
import { saveToken, deleteToken } from '../../utils/auth';
// unused import but this adds nasa png image to the build as we use png image for email notification
import nasaLogo from '../../../assets/images/nasa-logo.png';

class Auth extends React.Component {
  constructor (props) {
    super(props);
    this.store = ourConfigureStore({});
    this.state = {body: ''};
    this.clickLogin = this.clickLogin.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async handleSubmit() {
    const { api, dispatch, queryParams } = this.props;
    const { inflight, tokens } = api;
    const { code } = queryParams;
    if (tokens.token!== null && document.getElementById('totp')?.value !== '') {
      dispatch(verify(document.getElementById('totp').value, tokens.token)).then(value => {
        const resp = value;
        let error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error || resp?.message
        if (error && !config.environment.match(/LOCALHOST/g)) {
          console.log(`An error has occurred: ${error}.`);
        } else {
          deleteToken();
          saveToken({ token: tokens.token, user: tokens.user });
          this.setState({ body: ''});
          if (!inflight && code) {
            window.location.href = config.basepath;
          } 
        }
      })
    } 
  }

  async componentDidMount () {
    const { dispatch, api, queryParams } = this.props;
    const { inflight, tokens } = api;
    const { code, state, redirect } = queryParams;
    if (this.store.getState().api.authenticated) {
      redirectWithToken();
    } else if (!inflight && code) {
      const { data } = await dispatch(mfaTokenFetch(code, state))
      const { token, user } = data;
      if (!('mfaSecretCode' in data)) {
        window.localStorage.setItem('auth-token', token);
        const updatedUsr = (Object.keys(user).length > 0 ? {...user, ...{authenticated: true}} : user);
        window.localStorage.setItem('auth-user', JSON.stringify(updatedUsr));
        window.location.href = config.basepath;
      } else this.setState({ body: this.renderQrCode(data.mfaSecretCode, user.username, user.issuer)});
    }
  }

  clickLogin () {
    const { dispatch, queryParams } = this.props;
    const { redirect } = queryParams;
    dispatch(login(redirect || 'dashboard'));
  }

  renderQrCode (secretCode, username, issuer) {
    const qrPrefix = `otpauth://totp/${issuer.replace(/(^\w+:|^)\/\//, '')}:${username}?secret=`;
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
          <div style={{ height: 'auto', margin: '0 auto', maxWidth: 150, width: '100%' }}>
            <QRCode
              size={500}
              style={{ height: 'auto', maxWidth: '100%', width: '100%', marginTop: '2rem' }}
              value={`${qrPrefix}${secretCode}`}
              viewBox={'0 0 500 500'}
            />
          </div>
          <div id="secretcode" style={{ marginTop: '2rem' }}>Setup Code: <strong style={{wordBreak:'break-all'}}>{secretCode}</strong></div>
          <input type="hidden" id="secret" name="secret" value={secretCode} />
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
    const showLoginButton = !this.store.getState().api.authenticated && !api.inflight && !code && !token;
    const showAuthMessage = (api.inflight || code || token) && this.store.getState().api.authenticated;

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
