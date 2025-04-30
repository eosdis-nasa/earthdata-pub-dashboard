'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  getRequest,
  reviewRequest,
  listRequestReviewers
} from '../../actions';
import { requestPrivileges } from '../../utils/privileges';

class ReviewStep extends React.Component {
  constructor() {
    super();
    this.displayName = 'Review Step';
    this.state = {};
  }

  componentDidMount() {
    const requestId = this.props.location.search.split('=')[1];
    const { dispatch } = this.props;
    dispatch(getRequest(requestId));
    dispatch(listRequestReviewers(requestId));
  }

  formatComments(approval) {
    if (document.querySelectorAll('textarea#comment') !== undefined && document.querySelectorAll('textarea#comment')[0] !== undefined) {
      const savedBefore = localStorage.getItem(`${this.props.requests.detail.data.id}_${this.props.requests.detail.data.step_name}`);
      const hasCurrentValue = document.querySelectorAll('textarea#comment')[0].value !== '';
      if (!approval && (savedBefore === null && !hasCurrentValue)) {
        document.querySelectorAll('textarea#comment')[0].placeholder = 'required';
        document.querySelectorAll('textarea#comment')[0].classList.add('required');
      } else {
        document.querySelectorAll('textarea#comment')[0].placeholder = 'Enter a comment';
        document.querySelectorAll('textarea#comment')[0].classList.remove('required');
      }
    }
  }

  async review(id, approval) {
    this.formatComments(approval);
    if (document.querySelectorAll('textarea#comment') !== undefined && document.querySelectorAll('textarea#comment')[0] !== undefined) {
      const savedBefore = localStorage.getItem(`${this.props.requests.detail.data.id}_${this.props.requests.detail.data.step_name}`);
      const re = new RegExp(document.querySelectorAll('textarea#comment')[0].value, 'i');
      const currentInboxValueInSaved = document.getElementById('previously-saved').innerHTML.match(re);
      const hasCurrentValue = document.querySelectorAll('textarea#comment')[0].value !== '';
      if (((!approval && savedBefore === 'saved') || (!approval && hasCurrentValue)) || approval) {
        if (currentInboxValueInSaved == null) {
          document.querySelectorAll('button.button--reply')[0].click();
        }
        const { dispatch } = this.props;
        await dispatch(reviewRequest(id, approval));
        if (!approval) {
          localStorage.removeItem(`${this.props.requests.detail.data.id}_${this.props.requests.detail.data.step_name}`)
        }
        window.location.href = `${window.location.origin}${window.location.pathname.split(/forms/)[0]}requests`;
      }
    }
  }

  hasStepData() {
    if (typeof this.props.requests !== 'undefined' &&
      typeof this.props.requests.detail.data !== 'undefined' &&
      typeof this.props.requests.detail.data.step_data !== 'undefined') {
      return true;
    } else {
      return false;
    }
  }

  inReviewers(){
    const { roles } = this.props;
    const role = roles ? Object.keys(roles).map(role => roles[role].short_name) : [];
    const reviewers = this.props.rawReviewers.data
      .filter(reviewer => this.props.requests.detail.data.step_data.name === reviewer.step_name);
    return reviewers.some(reviewer => reviewer.name === this.props.user) || (reviewers.length === 0 && role.some((userRole) => userRole !== 'observer'));
  }

  render() {
    const search = this.props.location.search.split('=');
    const requestId = search[1].replace(/&step/g, '');
    const step = search[2];
    let { canReview } = requestPrivileges(this.props.privileges, step);
    let reviewable = false;
    let reviewReady = false;
    let stepName = '';
    if (this.hasStepData()) {
      const request = this.props.requests.detail.data;
      reviewReady = request && request.step_data.type === 'review';
      stepName = request.step_data.name
      if (canReview && this.inReviewers()) {
        reviewable = true;
      }
    }
    return (
      <div className='page__component'>
        <section className='page_section'>
          {reviewable && reviewReady && typeof requestId !== 'undefined' && (
            <div className='flex__row reject-approve'>
              <div className='flex__item--spacing'>
                <button onClick={() => this.review(requestId, false)}
                  className='button button--cancel button__animation--md button__arrow button__arrow--md button__animation button--secondary form-group__element--right'>
                  Return
                </button>
              </div>
              <div className='flex__item--spacing'>
                <button onClick={() => this.review(requestId, true)}
                  className='button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white form-group__element--right'>
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

ReviewStep.propTypes = {
  match: PropTypes.object,
  dispatch: PropTypes.func,
  requests: PropTypes.object,
  rawReviewers: PropTypes.object,
  logs: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  privileges: PropTypes.object,
  user: PropTypes.string,
  params: PropTypes.object,
  roles: PropTypes.array
};

export default withRouter(connect(state => ({
  requests: state.requests,
  rawReviewers: state.reviewers,
  privileges: state.api.tokens.privileges,
  user: state.api.tokens.userName,
  logs: state.logs,
  roles: state.api.tokens.roles
}))(ReviewStep));
