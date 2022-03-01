'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  getRequest,
  reviewRequest
} from '../../actions';
import { strings } from '../locale';
import { requestPrivileges } from '../../utils/privileges';

class ReviewStep extends React.Component {
  constructor () {
    super();
    this.displayName = strings.review_step_display_name;
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

  render () {
    const { canReview } = requestPrivileges(this.props.privileges);
    const requestId = this.props.location.search.split('=')[1];
    let reviewReady = false;
    if (this.hasStepData()) {
      const request = this.props.requests.detail.data;
      reviewReady = request && request.step_data.type === 'review';
    }
    return (
        <div className='page__component'>
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

ReviewStep.displayName = 'Review Step';

export default withRouter(connect(state => ({
  requests: state.requests,
  privileges: state.api.tokens.privileges,
  logs: state.logs
}))(ReviewStep));
