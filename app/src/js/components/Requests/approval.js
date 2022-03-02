'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  getRequest,
  reviewRequest
} from '../../actions';
import {
  lastUpdated
} from '../../utils/format';
import { strings } from '../locale';
import { requestPrivileges } from '../../utils/privileges';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

class ApprovalStep extends React.Component {
  constructor () {
    super();
    this.displayName = strings.review_step_display_name;
    this.state = {};
  }

  componentDidMount () {
    const search = this.props.location.search.split('=');
    const requestId = search[1].replace(/&step/g, '');
    const { dispatch } = this.props;
    dispatch(getRequest(requestId));
  }

  async review (id, approval) {
    await this.props.dispatch(reviewRequest(id, approval));
    window.location.href = '/requests';
  }

  hasStepData () {
    if (typeof this.props.requests !== 'undefined' &&
    typeof this.props.requests.detail.data !== 'undefined' &&
    typeof this.props.requests.detail.data.step_data !== 'undefined') {
      return true;
    } else {
      return false;
    }
  }

  getFormalName (str) {
    if (typeof str === 'undefined') return '';
    const count = (str.match(/_/g) || []).length;
    if (count > 0) {
      str = str.replace(/_/g, ' ');
    }
    const words = str.split(' ');
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }
    return words.join(' ');
  }

  render () {
    const { canReview } = requestPrivileges(this.props.privileges);
    const search = this.props.location.search.split('=');
    const requestId = search[1].replace(/&step/g, '');
    const step = search[2];
    const stepName = this.getFormalName(step);
    let reviewReady = false;
    let request = '';
    if (this.hasStepData()) {
      request = this.props.requests.detail.data;
      reviewReady = request && request.step_data.type === 'action';
    }
    const breadcrumbConfig = [
      {
        label: 'Dashboard Home',
        href: '/'
      },
      {
        label: 'Requests',
        href: '/requests'
      },
      {
        label: 'Approve',
        href: '/requests/approve',
        active: true
      }
    ];
    return (
        <div className='page__component'>
          <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>

        <section className='page__section'>
          <h1 className='heading--large heading--shared-content with-description width--three-quarters'>{requestId}</h1>
          { request && lastUpdated(request.last_change, 'Updated') }
          { request
            ? <dl className='status--process'>
              <dt>Request Status:</dt>
              <dd className={request.status}>{request.status}</dd>
            </dl>
            : null }
        </section>
        <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium with-description'><strong>Step</strong>:&nbsp;&nbsp;&nbsp;&nbsp;{stepName}</h2>
            <br />
            <br />
          </div>
        </section>
          <section className='page_section'>
              { canReview && reviewReady && typeof requestId !== 'undefined' && (
                  <div className='flex__row'>
                      <div className='flex__item--spacing'>
                          <button onClick={() => this.review(requestId, false)}
                              className='button button--no-icon button--medium button--green'>
                              Reject
                          </button>
                      </div>
                      <div className='flex__item--spacing'>
                          <button onClick={() => this.review(requestId, true)}
                              className='button button--no-icon button--medium button--green'>
                              Approve
                          </button>
                      </div>
                  </div>
              )}
            </section>
        </div>
    );
  }
}

ApprovalStep.propTypes = {
  match: PropTypes.object,
  dispatch: PropTypes.func,
  requests: PropTypes.object,
  logs: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  privileges: PropTypes.object,
  params: PropTypes.object
};

ApprovalStep.displayName = 'ApproveStep';

export default withRouter(connect(state => ({
  requests: state.requests,
  privileges: state.api.tokens.privileges,
  logs: state.logs
}))(ApprovalStep));
