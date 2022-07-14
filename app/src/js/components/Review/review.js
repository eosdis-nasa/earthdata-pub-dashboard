'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {Link, withRouter} from 'react-router-dom';
import {
  getRequest,
  reviewRequest
} from '../../actions';
import { strings } from '../locale';
import { requestPrivileges } from '../../utils/privileges';

class ReviewStep extends React.Component {
  constructor () {
    super();
    this.displayName = 'Review Step';
    this.state = {};
  }

  componentDidMount () {
    const requestId = this.props.location.search.split('=')[1];
    const { dispatch } = this.props;
    dispatch(getRequest(requestId));
  }

  async review (id, approval) {
    const { dispatch } = this.props;
    await dispatch(reviewRequest(id, approval));
    window.location.href = `${window.location.origin}${window.location.pathname.split(/forms/)[0]}requests`;
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

  render () {
    const { canReview } = requestPrivileges(this.props.privileges);
    const requestId = this.props.location.search.split('=')[1];
    let reviewable = false;
    let reviewReady = false;
    if (this.hasStepData()) {
      const request = this.props.requests.detail.data;
      reviewReady = request && request.step_data.type === 'review';
      if (canReview) {
        reviewable = true;
      }
    }
    return (
        <div className='page__component'>
          <section className='page_section'>
            { reviewable && reviewReady && typeof requestId !== 'undefined' && (
              <div className='flex__row reject-approve'>
                <div className='flex__item--spacing'>
                  <button onClick={() => this.review(requestId, false)}
                      className='button button--cancel button__animation--md button__arrow button__arrow--md button__animation button--secondary form-group__element--right'>
                      Reject
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
  logs: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  privileges: PropTypes.object,
  params: PropTypes.object
};

export default withRouter(connect(state => ({
  requests: state.requests,
  privileges: state.api.tokens.privileges,
  logs: state.logs
}))(ReviewStep));
