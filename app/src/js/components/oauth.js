'use strict';

import React from 'react';
import { connect } from 'react-redux';
import withQueryParams from 'react-router-query-params';
import { withRouter } from 'react-router-dom';
import { login } from '../actions';
import { window } from '../utils/browser';
import { buildRedirectUrl } from '../utils/format';
import _config from '../config';
import PropTypes from 'prop-types';
import ErrorReport from './Errors/report';
import Header from './Header/header';
import Modal from 'react-bootstrap/Modal';

const { updateDelay, apiRoot } = _config;

const authUrl = new URL('token', apiRoot);

class OAuth extends React.Component {
  constructor () {
    super();
    this.state = {
      token: null,
      error: null
    };
  }

  componentDidUpdate () {
    const { api } = this.props;
    const { authenticated } = api;
    if (authenticated) {
      setTimeout(() => this.props.history.push('/'), updateDelay);
    }
  }

  componentDidMount () {
    const { dispatch, api, queryParams } = this.props;
    const { authenticated, inflight } = api;
    const { token, code, state } = queryParams;
    if (!authenticated && !inflight) {
      if (token) {
        dispatch(login(token, state));
      } else if (code) {
        const tokenUrl = new URL(authUrl);
        tokenUrl.searchParams.set('code', code);
        if (state) {
          tokenUrl.searchParams.set('state', state);
        }
        window.location.href = tokenUrl.href;
      }
    }
  }

  render () {
    const { dispatch, api, apiVersion } = this.props;

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
                { api.inflight
                  ? <h2 className='heading--medium'>Authenticating ... </h2>
                  : null }
                { api.error
                  ? <ErrorReport report={api.error} />
                  : null }
              </Modal.Body>
              <Modal.Footer>
                { !api.authenticated && !api.inflight
                  ? <LoginButton redirect={buildRedirectUrl(window.location)} />
                  : null }
              </Modal.Footer>
            </Modal>
          </div>
        </main>
      </div>
    );
  }
}

function LoginButton ({ redirect }) {
  const loginUrl = new URL(authUrl);
  loginUrl.searchParams.set('state', redirect);
  return (
    <div style={{ textAlign: 'center' }}>
      <a className="button button--oauth" href={loginUrl.href} >
        Login to Earthdata Pub
      </a>
    </div>
  );
}

LoginButton.propTypes = {
  redirect: PropTypes.string
};

OAuth.propTypes = {
  dispatch: PropTypes.func,
  api: PropTypes.object,
  location: PropTypes.object,
  history: PropTypes.object,
  apiVersion: PropTypes.object,
  queryParams: PropTypes.object
};

export default withRouter(withQueryParams()(connect(state => state)(OAuth)));
