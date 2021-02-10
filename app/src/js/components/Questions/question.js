'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  getQuestion
} from '../../actions';
import Loading from '../LoadingIndicator/loading-indicator';
import ErrorReport from '../Errors/report';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

function Question ({ title, version, text, help, inputs }) {
  return (
    <div>
      <h3>Title: {title}</h3>
      <h3>Version: {version}</h3>
      <h3>Text: {text}</h3>
      <h3>Help: {help}</h3>
      <h3>Inputs: </h3>
      <div className='model-builder-array'>
        { inputs.map(input => (
          <Input
            key={input.control_id}
            id={input.control_id}
            label={input.label}
            type={input.type} />
        ))}
      </div>
    </div>);
}

function Input ({ id, label, type }) {
  return (
    <div className='array-item'>
      <h4>id: {id}</h4>
      <h4>label: {label}</h4>
      <h4>type: {type}</h4>
    </div>
  );
}

class QuestionOverview extends React.Component {
  constructor () {
    super();
    this.navigateBack = this.navigateBack.bind(this);
    this.displayName = strings.question;
    this.state = {};
  }

  componentDidMount () {
  }

  componentWillUnmount () {
  }

  componentWillMount() {
    const { dispatch } = this.props;
    const { questionId } = this.props.match.params;
    dispatch(getQuestion(questionId));
  }

  navigateBack () {
    const { history } = this.props;
    history.push('/questions');
  }

  render () {
    const { dispatch } = this.props;
    const { questionId } = this.props.match.params;
    const record = this.props.questions.detail;
    const question = record.data || false;
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
        { record.inflight && <Loading /> }
        { question &&
          <Question
            id={question.id}
            title={question.long_name}
            version={question.version}
            text={question.text}
            help={question.help}
            inputs={question.inputs} />
          }
        </section>
      </div>
    );
  }
}

Question.propTypes = {
  title: PropTypes.string,
  version: PropTypes.number,
  text: PropTypes.string,
  help: PropTypes.string,
  inputs: PropTypes.array
};

Input.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  type: PropTypes.string
};

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
