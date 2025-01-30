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
      <h1>Title: {title}</h1>
      <h2>Version: {version}</h2>
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

class InputOverview extends React.Component {
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

  navigateBack () {
    const { history } = this.props;
    history.push('/inputs');
  }

  render () {
    const { questionId } = this.props.match.params;
    const record = this.props.questions.detail;
    const breadcrumbConfig = [
      {
        label: 'Dashboard Home',
        href: '/'
      },
      {
        label: 'Inputs',
        href: '/inputs'
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
          { record.error
            ? <ErrorReport report={record.error} />
            : record.data
              ? <Question
                id={record.data.id}
                title={record.data.long_name}
                version={record.data.version}
                text={record.data.text}
                help={record.data.help}
                inputs={record.data.inputs ? record.data.inputs : []} />
              : null
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

InputOverview.propTypes = {
  match: PropTypes.object,
  dispatch: PropTypes.func,
  questions: PropTypes.object,
  logs: PropTypes.object,
  history: PropTypes.object,
  skipReloadOnMount: PropTypes.bool
};

InputOverview.defaultProps = {
  skipReloadOnMount: false
};

export { InputOverview };

export default withRouter(connect(state => ({
  questions: state.questions,
  logs: state.logs
}))(InputOverview));
