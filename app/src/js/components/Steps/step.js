'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  getStep
} from '../../actions';
import Loading from '../LoadingIndicator/loading-indicator';
import ErrorReport from '../Errors/report';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

function Step ({ step_id, step_name, step_status_label, type, action_id, form_id, service_id }) {
  return (
    <div>
      <h1>ID: {step_id}</h1>
      <h2>Name: {step_name}</h2>
      <h3>Status Label: {step_status_label}</h3>
      <h3>Type: {type}</h3>
      { action_id ? <h3>Action ID: {action_id}</h3> : null}
      { form_id ? <h3>Form ID: {form_id}</h3> : null}
      { service_id ? <h3>Service ID: {service_id}</h3> : null}
    </div>);
}

class StepOverview extends React.Component {
  constructor () {
    super();
    this.navigateBack = this.navigateBack.bind(this);
    this.displayName = strings.step;
    this.state = {};
  }

  componentDidMount () {
    const { dispatch } = this.props;
    const { stepId } = this.props.match.params;
    dispatch(getStep(stepId));
  }

  navigateBack () {
    const { history } = this.props;
    history.push('/steps');
  }

  render () {
    const { stepId } = this.props.match.params;
    const record = this.props.steps.detail;
    const breadcrumbConfig = [
      {
        label: 'Dashboard Home',
        href: '/'
      },
      {
        label: 'Steps',
        href: '/steps'
      },
      {
        label: stepId,
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
              ? <Step
                step_id={record.data.step_id}
                step_name={record.data.step_name}
                step_status_label={record.data.step_status_label}
                type={record.data.type}
                action_id={record.data.action_id}
                form_id={record.data.form_id}
                service_id={record.data.service_id} />
              : null
          }
        </section>
      </div>
    );
  }
}

Step.propTypes = {
  step_id: PropTypes.string,
  step_name: PropTypes.string,
  step_status_label: PropTypes.string,
  type: PropTypes.string,
  action_id: PropTypes.string,
  form_id: PropTypes.string,
  service_id: PropTypes.string
};

StepOverview.propTypes = {
  match: PropTypes.object,
  dispatch: PropTypes.func,
  steps: PropTypes.object,
  logs: PropTypes.object,
  history: PropTypes.object,
  skipReloadOnMount: PropTypes.bool
};

StepOverview.defaultProps = {
  skipReloadOnMount: false
};

export { StepOverview };

export default withRouter(connect(state => ({
  steps: state.steps,
  logs: state.logs
}))(StepOverview));
