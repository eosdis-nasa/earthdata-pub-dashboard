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
import config from '../../config';
import ourConfigureStore from '../../store/configureStore';
import { MFA } from './mfa';
// unused import but this adds nasa png image to the build as we use png image for email notification
import nasaLogo from '../../../assets/images/nasa-logo.png';

class Auth extends React.Component {
  constructor (props) {
    super(props);
    this.store = ourConfigureStore({});
    this.state = { body: '' };
    this.clickLogin = this.clickLogin.bind(this);
  }

  async componentDidMount () {
    const { dispatch, api, queryParams } = this.props;
    const { inflight, tokens } = api;
    const { code, state, redirect } = queryParams;
    console.log(api);
    if (this.store.getState().api.authenticated) {
      redirectWithToken();
    } else if (!inflight && code) {
      const { data } = await dispatch(mfaTokenFetch(code, state));
      const { token, user } = data;
      if (!('mfaSecretCode' in data)) {
        window.localStorage.setItem('auth-token', token);
        const updatedUsr = (Object.keys(user).length > 0 ? {...user, ...{authenticated: true}} : user);
        window.localStorage.setItem('auth-user', JSON.stringify(updatedUsr));
        window.location.href = config.basepath;
      } else this.setState({
        body: <MFA
              secretCode={data.mfaSecretCode}
              username={user.username}
              issuer={user.issuer}
              api={api}
              dispatch={dispatch}
              queryParams={queryParams}/>
        });
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
        <main className='main' role='main'>
          <div className="modal-content">
            <Modal
              dialogClassName="oauth-modal"
              show={true}
              centered
              size={this.state.body ? 'xl': 'sm'}
              aria-labelledby="modal__oauth-modal"
            >
              <Modal.Header className="oauth-modal__header"></Modal.Header>
              {this.state.body == '' &&
                <Modal.Title id="modal__oauth-modal" className="oauth-modal__title">Welcome To Earthdata Pub</Modal.Title>}
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
