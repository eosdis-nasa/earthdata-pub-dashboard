'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import {
  getStep,
  updateStep,
  addStep
} from '../../actions';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { userPrivileges } from '../../utils/privileges';
import Select from 'react-select';
import { startCase } from 'lodash';

class Steps extends React.Component {
  constructor () {
    super();
    this.state = {
      stepName: '',
      stepStatusLabel: '',
      stepType: '',
      typeID: ''
    };
  }

  async componentDidMount () {
    const { dispatch } = this.props;
    const { stepId } = this.props.match.params;
    if (stepId) {
      const { data } = await dispatch(getStep(stepId));
      this.setState({
        stepName: data.step_name,
        stepStatusLabel: data.step_status_label || '',
        stepType: data.type,
        typeID: data.action_id || data.service_id || data.form_id || ''
      });
    }
  }

  render () {
    const stepTypeEnum = ['init', 'action', 'form', 'review', 'service', 'close'];
    const { stepId } = this.props.match.params;
    const { dispatch, history } = this.props;
    const record = (stepId ? this.props.steps.detail : { data: {} });
    const { canUpdateWorkflow } = userPrivileges(this.props.privileges);
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
        label: stepId || 'Add Step',
        active: true
      }
    ];

    const handleSubmit = async () => {
      const payload = {
        step_name: this.state.stepName,
        step_status_label: this.state.stepStatusLabel,
        type: this.state.stepType
      };
      Array('action', 'form', 'service').includes(this.state.stepType) ? payload[`${this.state.stepType}_id`] = this.state.typeID : null;
      dispatch(addStep(payload));
      setTimeout(() => {
        history.push('/steps');
      }, '500');
    }

    return (
            <div className='page__component'>
                <section className='page__section page__section__controls'>
                    <Breadcrumbs config={breadcrumbConfig} />
                </section>
                <div className='heading__wrapper--border'>
                  <h1 className='heading--large heading--shared-content with-description'>
                      {record.data ? (record.data.step_id ? 'Edit Step' : 'Add Step') : '...'}
                  </h1>
                </div>
                <section className='page__section page__section__controls step-section'>
                  {stepId ?
                    <div className = "step_attr">
                      <label className='heading--small' htmlFor="step_id">Step Id</label>
                      <input type="text" id="step_id" name="step_id" value={stepId} readOnly/>
                    </div> : null
                  }
                  <div className = "step_attr">
                    <label className='heading--small' htmlFor="step_name">Step Name</label>
                    <input type="text" id="step_name" name="step_name" value={this.state.stepName}
                    onChange={e => this.setState({stepName: e.target.value})} />
                  </div>
                  <div className = "step_attr">
                    <label className='heading--small' htmlFor="step_status_label">Step Status Label</label>
                    <input type="text" id="step_status_label=" name="step_status_label" value={this.state.stepStatusLabel}
                    onChange={e => this.setState({stepStatusLabel: e.target.value})} />
                  </div>
                  <div className = "step_attr">
                    <label className='heading--small' htmlFor="step_type">Type</label>
                    <Select
                      id="stepTypeSelector"
                      options={stepTypeEnum.map((type) => ({value: type, label: type}))}
                      onChange={e => {this.setState({stepType: e.value})}}
                      isSearchable={true}
                      placeholder={this.state.stepType || 'Select Step Type'}
                      className='selectButton stepTypeSelect'
                      aria-label='select-step-type-dropdown'
                      value={this.state.stepType}
                    />
                  </div>
                  {['action', 'form', 'service'].includes(this.state.stepType) ?
                    <div className = "step_attr">
                      <label className='heading--small' htmlFor="type_id">{startCase(this.state.stepType)} ID</label>
                      <input type="text" id="type_id" name="type_id" value={this.state.typeID}
                      onChange={e => this.setState({typeID: e.target.value})} />
                    </div> : null
                  }
                </section>
                {canUpdateWorkflow
                  ? <section className='page__section'>
                  <Link className={'button button--cancel button__animation--md button__arrow button__arrow--md button__animation button--secondary'}
                  to={'/steps'} id='cancelButton' aria-label="cancel step editing">
                      Cancel
                  </Link>
                  <button className={'button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'}
                  onClick={handleSubmit} aria-label="submit your steps">
                      Submit
                  </button>
                </section>
                  : null}
            </div>
    );
  }
}

Steps.propTypes = {
  match: PropTypes.object,
  steps: PropTypes.object,
  dispatch: PropTypes.func,
  history: PropTypes.object,
  privileges: PropTypes.object
};

export default withRouter(connect(state => ({
  privileges: state.api.tokens.privileges,
  steps: state.steps
}))(Steps));
