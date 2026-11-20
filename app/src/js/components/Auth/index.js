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
import ourConfigureStore from '../../store/configureStore';
import { saveToken } from '../../utils/auth';
// unused import but this adds nasa png image to the build as we use png image for email notification
import nasaLogo from '../../../assets/images/nasa-logo.png';
import mainLogo from '../../../assets/images/nasa-logo.svg';

class Auth extends React.Component {
  constructor (props) {
    super(props);
    this.store = ourConfigureStore({});
    this.state = { body: '' };
    this.clickLogin = this.clickLogin.bind(this);
  }

  async componentDidMount () {
    const { dispatch, api, queryParams } = this.props;
    const { inflight } = api;
    const { code, state } = queryParams;
    if (this.store.getState().api.authenticated) {
      redirectWithToken();
    } else if (!inflight && code) {
      const { data } = await dispatch(fetchToken(code, state));
      const { token, user } = data;
      saveToken({ token, user: { ...user, ...{ authenticated: true } } });
      redirectWithToken();
    }
  }

  clickLogin () {
    const { dispatch, queryParams } = this.props;
    const { redirect } = queryParams;
    dispatch(login(redirect || 'dashboard'));
  }

  render () {
    const { dispatch, api, apiVersion, queryParams } = this.props;
    const { code, token } = queryParams;
    const showLoginButton = !this.store.getState().api.authenticated && !api.inflight && !code && !token;
    const showAuthMessage = (api.inflight || code || token) && this.store.getState().api.authenticated;

    return (
      <div className='app'>
        <Header dispatch={dispatch} api={api} apiVersion={apiVersion} minimal={true} />
        <main id="main-content" className='main' tabIndex={-1}>
          <div className="modal-content">
            <Modal
              className="oauth-modal-root"
              dialogClassName="oauth-modal"
              show={true}
              centered
              backdrop={true}
              backdropClassName="oauth-modal-backdrop"
              enforceFocus={false}
              size={this.state.body ? 'xl' : undefined}
              aria-labelledby="modal__oauth-modal"
            >
              <Modal.Header className="oauth-modal__header" closeButton={false}>
                <img src={mainLogo} alt="" />
                {this.state.body == '' &&
                  <Modal.Title as="h1" id="modal__oauth-modal" className="oauth-modal__title">Welcome to Earthdata Pub</Modal.Title>}
                {this.state.body == '' &&
                  <p className="oauth-modal__lead">Sign in with your Earthdata Login account.</p>}
              </Modal.Header>
              <Modal.Body className={this.state.body || api.error || showAuthMessage ? undefined : 'oauth-modal__body--quiet'}>
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
