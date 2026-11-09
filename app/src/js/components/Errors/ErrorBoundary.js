import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { componentNameFromStack, crashReportPayload, openFeedbackForm } from '../../utils/feedback';
import mainLogo from '../../../assets/images/nasa-logo.svg';
import './ErrorBoundary.css';

function createReferenceId () {
  const bytes = new Uint8Array(4);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `EDP-${hex}`;
}

class ErrorBoundary extends Component {
  constructor (props) {
    super(props);
    this.state = {
      hasError: false,
      referenceId: null,
      reportPreview: null,
      copied: false
    };
    this.reportContext = { page: '/', errorName: '', component: '', when: '' };
    this.reportProblem = this.reportProblem.bind(this);
    this.reloadPage = this.reloadPage.bind(this);
    this.goHome = this.goHome.bind(this);
    this.copyReference = this.copyReference.bind(this);
  }

  static getDerivedStateFromError () {
    return {
      hasError: true,
      referenceId: createReferenceId()
    };
  }

  componentDidCatch (error, errorInfo) {
    this.reportContext = {
      page: window.location.pathname || '/',
      errorName: error && error.name,
      component: componentNameFromStack(errorInfo),
      when: new Date().toISOString()
    };
    console.error('Earthdata Pub crash', this.state.referenceId, error, errorInfo);
  }

  reportProblem (event) {
    const reportPreview = crashReportPayload(this.state.referenceId, this.reportContext);
    const opened = openFeedbackForm(event, reportPreview);
    const host = window.location.hostname;
    const local = host === 'localhost' || host === '127.0.0.1';
    if (local || !opened) {
      this.setState({ reportPreview });
    }
  }

  reloadPage () {
    window.location.reload();
  }

  goHome () {
    window.location.assign('/');
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
    const { hasError, referenceId, reportPreview, copied } = this.state;

    if (hasError) {
      return (
        <div className="crash-screen" role="alert">
          <div className="crash-screen__card">
          <div className="crash-screen__brand">
            <img src={mainLogo} alt="" />
            <span>EDPub</span>
          </div>
          <h1>We're sorry</h1>
          <p>
            This page didn't load. You can try it again, or go back to Earthdata Pub and continue.
            If it keeps happening, report the problem and add what you were doing.
            Your answers and sign-in information are not included.
          </p>
          {referenceId && (
            <p className="crash-screen__reference">
              Reference <span data-testid="crash-reference">{referenceId}</span>
              <button type="button" className="crash-screen__copy" onClick={this.copyReference}>
                {copied ? 'Copied' : 'Copy'}
              </button>
            </p>
          )}
          <div className="crash-screen__actions">
            <button type="button" className="button button--secondary button--small button--no-icon" onClick={this.goHome}>
              Back to Earthdata Pub
            </button>
            <button type="button" className="button button--secondary button--small button--no-icon" onClick={this.reloadPage}>
              Try again
            </button>
            <button type="button" className="button button--small button--no-icon" onClick={this.reportProblem}>
              Report a problem
            </button>
          </div>
          {reportPreview && (
            <div className="crash-screen__preview" data-testid="crash-report-preview">
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

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
