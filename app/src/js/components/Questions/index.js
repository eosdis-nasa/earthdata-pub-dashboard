import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'object-path';
import { connect } from 'react-redux';
import { withRouter, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import { listQuestions } from '../../actions';
import QuestionOverview from './question';
import QuestionsOverview from './overview';
import EditQuestion from './edit';

const Questions = ({
  dispatch,
  location,
  params,
  stats
}) => {
  const { pathname } = location;
  const count = get(stats, 'count.data.questions.count');
  dispatch(listQuestions());

  return (
    <div className='page__questions'>
      <div className='content__header'>
        <div className='row'>
          <h1 className='heading--xlarge heading--shared-content'>Questions</h1>
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
              <Route exact path='/questions' component={QuestionsOverview} />
              <Route path='/questions/id/:questionId' component={QuestionOverview} />
              <Route path='/questions/edit/:questionId' component={EditQuestion} />
              <Route path='/questions/add' component={EditQuestion} />
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
};

Questions.propTypes = {
  location: PropTypes.object,
  params: PropTypes.object,
  dispatch: PropTypes.func,
  stats: PropTypes.object
};

export default withRouter(connect(state => ({
  stats: state.stats
}))(Questions));
