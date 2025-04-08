import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import RequestOverview from './request';
import RequestsOverview from './overview';
import InactiveRequestsOverview from './withdrawn';
import ApprovalStep from './approval';
import ActionRequestsOverview from './status';
import EsdisApprovalStep from './esdis-approval';
import AdditionalReviewQuestion from './additional_review';

const Requests = ({
  location,
  params
}) => {
  const { pathname } = location;
  return (
    <div className='page__requests'>
      <div className='content__header'>
        <div className='row'>
          <h1 className='heading--xlarge heading--shared-content'>Requests</h1>
        </div>
      </div>
      <div className='page__content'>
        <div className='wrapper__sidebar'>
          <Sidebar
            currentPath={pathname}
            params={params}
          />
          <div className='page__content--shortened'>
            <Switch>
              <Route exact path='/requests/id/:requestId' component={RequestOverview} />
              <Route exact path='/requests' component={RequestsOverview} />
              <Route path='/requests/withdrawn' component={InactiveRequestsOverview} />
              <Route path='/requests/approval/esdis' component={EsdisApprovalStep} />
              <Route path='/requests/approval' component={ApprovalStep} />
              <Route path='/requests/status' component={ActionRequestsOverview} />
              <Route path='/requests/question' component={AdditionalReviewQuestion} />
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
};

Requests.propTypes = {
  location: PropTypes.object,
  params: PropTypes.object,
  dispatch: PropTypes.func,
  stats: PropTypes.object
};

export default withRouter(connect(state => ({
  stats: state.stats
}))(Requests));
