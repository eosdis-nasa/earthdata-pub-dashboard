'use strict';
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { history } from '../store/configureStore';
import { createErrorReferenceId, crashReportPayload, isReferenceId, openFeedbackForm } from '../utils/feedback';
import mainLogo from '../../assets/images/nasa-logo.svg';
import './Errors/ErrorBoundary.css';

function searchFromProps (props) {
  const location = (props.router && props.router.location) || props.location || {};
  return typeof location.search === 'string' ? location.search : '';
}

function referenceFromLocation (props) {
  const ref = new URLSearchParams(searchFromProps(props)).get('ref');
  return isReferenceId(ref) ? ref : '';
}

function pageFromLocation (props) {
  const page = new URLSearchParams(searchFromProps(props)).get('from');
  if (typeof page !== 'string' || !page.startsWith('/') || page.length > 200) return '/error';
  if (/[?#\s]/.test(page)) return '/error';
  return page;
}

class Error extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      referenceId: referenceFromLocation(props) || createErrorReferenceId(),
      copied: false,
      reportPreview: null
    };
    this.tryAgain = this.tryAgain.bind(this);
    this.signIn = this.signIn.bind(this);
    this.reportProblem = this.reportProblem.bind(this);
    this.copyReference = this.copyReference.bind(this);
  }

  tryAgain () {
    if (window.history.length > 1) {
      history.goBack();
      return;
    }
    history.push('/');
  }

  signIn () {
    history.push('/auth');
  }

  reportProblem (event) {
    const reportPreview = crashReportPayload(this.state.referenceId, {
      page: pageFromLocation(this.props),
      kind: 'request',
      when: new Date().toISOString()
    });
    const opened = openFeedbackForm(event, reportPreview);
    const host = window.location.hostname;
    const local = host === 'localhost' || host === '127.0.0.1';
    if (local || !opened) {
      this.setState({ reportPreview });
    }
  }

  copyReference () {
    const referenceId = this.state.referenceId;
    if (!referenceId) return;
    const done = () => this.setState({ copied: true });
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(referenceId).then(done).catch(() => {});
      return;
    }
    done();
  }

  render () {
    const { referenceId, copied, reportPreview } = this.state;
    return (
      <div className="crash-screen" role="alert">
        <div className="crash-screen__card">
          <div className="crash-screen__brand">
            <img src={mainLogo} alt="" />
            <span>EDPub</span>
          </div>
          <h1>Something went wrong</h1>
          <p>
            Earthdata Pub could not finish that request. Try it again, or sign in if your session ended.
            If it keeps happening, report the problem and add what you were doing.
            Your answers and sign-in information are not included.
          </p>
          {referenceId && (
            <p className="crash-screen__reference">
              Reference <span data-testid="error-reference">{referenceId}</span>
              <button type="button" className="crash-screen__copy" onClick={this.copyReference}>
                {copied ? 'Copied' : 'Copy'}
              </button>
            </p>
          )}
          <div className="crash-screen__actions">
            <button type="button" className="button button--secondary button--small button--no-icon" onClick={this.tryAgain}>
              Try again
            </button>
            <button type="button" className="button button--secondary button--small button--no-icon" onClick={this.signIn}>
              Sign in
            </button>
            <button type="button" className="button button--small button--no-icon" onClick={this.reportProblem}>
              Report a problem
            </button>
          </div>
          {reportPreview && (
            <div className="crash-screen__preview" data-testid="error-report-preview">
              <p className="crash-screen__preview-note">
                Local preview. The Earthdata feedback form is not available here.
                On SIT and UAT this is what the form is filled in with.
              </p>
              <p className="crash-screen__preview-label">Subject</p>
              <p className="crash-screen__preview-subject">{reportPreview.subject}</p>
              <p className="crash-screen__preview-label">Message</p>
              <pre>{reportPreview.details}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }
}

Error.propTypes = {
  location: PropTypes.object,
  router: PropTypes.object
};

export default withRouter(connect(state => state)(Error));
