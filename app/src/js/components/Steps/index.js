import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'object-path';
import { connect } from 'react-redux';
import { withRouter, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import { listSteps } from '../../actions';
import StepOverview from './step';
import StepsOverview from './overview';
import EditStep from './edit';

const Steps = ({
  dispatch,
  location,
  params,
  stats
}) => {
  const { pathname } = location;
  const count = get(stats, 'count.data.steps.count');
  dispatch(listSteps());

  return (
    <div className='page__steps'>
      <div className='content__header'>
        <div className='row'>
          <h1 className='heading--xlarge heading--shared-content'>Steps</h1>
        </div>
      </div>
      <div className='page__content'>
        <div className='wrapper__sidebar'>
          <Sidebar
            currentPath={pathname}
            params={params}
            count={[count]}
          />
          <div className='page__content--shortened'>
            <Switch>
              <Route exact path='/steps' component={StepsOverview} />
              <Route path='/steps/id/:stepId' component={StepOverview} />
              <Route path='/steps/edit/:stepId' component={EditStep} />
              <Route path='/steps/add' component={EditStep} />
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
};

Steps.propTypes = {
  location: PropTypes.object,
  params: PropTypes.object,
  dispatch: PropTypes.func,
  stats: PropTypes.object
};

export default withRouter(connect(state => ({
  stats: state.stats
}))(Steps));
