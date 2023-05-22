'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import {
  getRequest,
  reviewRequest
} from '../../actions';
import {
  lastUpdated,
  shortDateShortTimeYearFirst
} from '../../utils/format';
import { requestPrivileges } from '../../utils/privileges';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import Table from '../SortableTable/SortableTable';
import Comments from '../Comments/comments';

class ApprovalStep extends React.Component {
  constructor () {
    super();
    this.displayName = 'ApproveStep';
  }

  componentDidMount () {
    const search = this.props.location.search.split('=');
    const requestId = search[1].replace(/&step/g, '');
    const { dispatch } = this.props;
    dispatch(getRequest(requestId));
  }

  formatComments (approval) {
    if (!approval && document.querySelectorAll('textarea#comment')[0].value === '') {
      document.querySelectorAll('textarea#comment')[0].placeholder = 'required';
      document.querySelectorAll('textarea#comment')[0].classList.add('required');
    } else {
      document.querySelectorAll('textarea#comment')[0].placeholder = 'Enter a comment';
      document.querySelectorAll('textarea#comment')[0].classList.remove('required');
    }
  }

  async review (id, approval) {
    this.formatComments(approval);
    if ((!approval && document.querySelectorAll('textarea#comment')[0].value !== '' && document.getElementById('previously-saved').innerHTML === '') || approval) {
      if (document.getElementById('previously-saved').innerHTML === '') {
        document.querySelectorAll('button.button--reply')[0].click();
      }
      const { dispatch } = this.props;
      await dispatch(reviewRequest(id, approval));
      window.location.href = `${window.location.origin}${window.location.pathname.split(/\/approval/)[0]}`;
    }
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
    let { canReview } = requestPrivileges(this.props.privileges);
    const search = this.props.location.search.split('=');
    const requestId = search[1].replace(/&step/g, '');
    const step = search[2];
    const stepName = this.getFormalName(step);
    let requestForms = [];
    let showTable = false;
    let reviewReady = false;
    let request = '';
    let verbage = ['Return', 'Approve'];
    if (this.hasStepData()) {
      request = this.props.requests.detail.data;
      if (request.step_data.type === 'action') {
        verbage = ['Go back', 'Continue'];
        reviewReady = true;
        canReview = true;
      }
      if (request.step_data.type === 'review') {
        if (this.props.requests.detail.data.forms !== null) {
          requestForms = this.props.requests.detail.data.forms;
        }
        reviewReady = true;
        showTable = true;
      }
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
    const tableColumns = [
      {
        Header: 'Name',
        accessor: row => <Link to={`/forms/id/${row.id}?requestId=${request.id}`} aria-label="View your form details">{row.long_name}</Link>,
        id: 'long_name'
      },
      {
        Header: 'Submitted at',
        accessor: row => shortDateShortTimeYearFirst(row.submitted_at),
        id: 'submitted_at'
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
        { canReview && reviewReady && typeof requestId !== 'undefined'
          ? <><Comments /></>
          : null
        }
        <section className='page_section'>
            { canReview && reviewReady && typeof requestId !== 'undefined' && (
                <div className='flex__row reject-approve'>
                      <div className='flex__item--spacing'>
                        <button onClick={() => this.review(requestId, false)}
                          className='button button--cancel button__animation--md button__arrow button__arrow--md button__animation button--secondary form-group__element--right'>
                          {verbage[0]}
                        </button>
                      </div>
                      <div className='flex__item--spacing'>
                      <button onClick={() => this.review(requestId, true)}
                          className='button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white form-group__element--right'>
                          {verbage[1]}
                      </button>
                    </div>
                </div>
            )}
          </section>
          <br />
          <br />
          <section className='page_section'>
            { showTable && typeof requestId !== 'undefined'
              ? <section className='page__section'>
                <div className='heading__wrapper--border'>
                  <h2 className='heading--medium heading--shared-content with-description'>Request Forms</h2>
                </div>
                <Table
                  data={requestForms}
                  dispatch={this.props.dispatch}
                  tableColumns={tableColumns}
                />
              </section>
              : null }
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

export default withRouter(connect(state => ({
  requests: state.requests,
  privileges: state.api.tokens.privileges,
  logs: state.logs
}))(ApprovalStep));
