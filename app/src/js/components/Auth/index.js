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

class Auth extends React.Component {
  constructor () {
    super();
    this.clickLogin = this.clickLogin.bind(this);
  }

  componentDidUpdate () {
    const { api, queryParams } = this.props;
    const { state } = queryParams;
    const { authenticated, tokens } = api;
    if (authenticated) {
      redirectWithToken(state, tokens.token);
    }
  }

  componentDidMount () {
    const { dispatch, api, queryParams } = this.props;
    const { authenticated, inflight, tokens } = api;
    const { code, state, redirect } = queryParams;
    if (authenticated) {
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

  render () {
    const { dispatch, api, apiVersion, queryParams } = this.props;
    const { code, token } = queryParams;
    const showLoginButton = !api.authenticated && !api.inflight && !code && !token;
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
                  <div>
                    <LoadingOverlay />
                    <h2 className='heading--medium'>
                      Authenticating...
                    </h2>
                  </div>
                }
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
