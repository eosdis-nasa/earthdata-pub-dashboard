'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  getQuestion
} from '../../actions';
import { get } from 'object-path';
import Loading from '../LoadingIndicator/loading-indicator';
import AsyncCommands from '../DropDown/dropdown-async-command';
import _config from '../../config';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';


class QuestionOverview extends React.Component {
  constructor () {
    super();
    this.navigateBack = this.navigateBack.bind(this);
    this.displayName = strings.question;
    this.state = {};
  }

  componentDidMount () {
    const { dispatch } = this.props;
    const { questionId } = this.props.match.params;
    dispatch(getQuestion(questionId));
  }

  componentWillUnmount () {
  }


  navigateBack () {
    const { history } = this.props;
    history.push('/questions');
  }

  render () {
    const { questionId } = this.props.match.params;
    const record = this.props.questions.map[questionId];
    if (!record || (record.inflight && !record.data)) {
      return <Loading />;
    } else if (record.error) {
      return <ErrorReport report={record.error} />;
    }

    const question = record.data;

    const breadcrumbConfig = [
      {
        label: 'Dashboard Home',
        href: '/'
      },
      {
        label: 'Questions',
        href: '/questions'
      },
      {
        label: questionId,
        active: true
      }
    ];

    return (
      <div className='page__component'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <section className='page__section page__section__header-wrapper'>
          <h1 className='heading--large heading--shared-content with-description width--three-quarters'>{question.title}</h1>
        </section>
      </div>
    );
  }
}

QuestionOverview.propTypes = {
  match: PropTypes.object,
  dispatch: PropTypes.func,
  questions: PropTypes.object,
  logs: PropTypes.object,
  history: PropTypes.object,
  skipReloadOnMount: PropTypes.bool
};

QuestionOverview.defaultProps = {
  skipReloadOnMount: false
};

export { QuestionOverview };

export default withRouter(connect(state => ({
  questions: state.questions,
  logs: state.logs
}))(QuestionOverview));
