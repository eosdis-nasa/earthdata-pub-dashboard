'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import {
  getRequest,
  setWorkflowStep,
  promoteStep
} from '../../actions';
import {
  lastUpdated,
  shortDateShortTimeYearFirst
} from '../../utils/format';
import { requestPrivileges } from '../../utils/privileges';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import Table from '../SortableTable/SortableTable';

class AdditionalReviewQuestion extends React.Component {
  constructor () {
    super();
    this.state = {
      requiresReview: null,
    };
    this.displayName = 'Workflow Question';
    this.handleSubmit = this.handleSubmit.bind(this);
    this.navigateBack = this.navigateBack.bind(this);
  }

  componentDidMount () {
    const search = this.props.location.search.split('=');
    const requestId = search[1].replace(/&step/g, '');
    const { dispatch } = this.props;
    dispatch(getRequest(requestId));
  }

  async handleSubmit () {
    // If the data requires additional scruitiny by the daac, just go to the next step in the workflow
    // If it doesn't - re-route the workflow so that the submission ends up at final daac selection
    const request = this.props.requests.detail.data;

    if (this.state.requiresReview === false) {
      const payload = {
        id: request.id,
        workflow_id: request.workflow_id,
        step_name: 'esdis_final_review'
      };
      await this.props.dispatch(setWorkflowStep(payload));
    }
    await this.props.dispatch(promoteStep({ id: request.id }))
      .then(() => {
        this.props.history.push('/requests');
      });
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

  navigateBack () {
    this.props.history.push('/requests');
  }

  setReviewState (reviewChoice) {
    this.setState({ requiresReview: reviewChoice });
  }

  render () {
    const search = this.props.location.search.split('=');
    const requestId = search[1].replace(/&step/g, '');
    const step = search[2];
    const stepName = this.getFormalName(step);
    const { canReview } = requestPrivileges(this.props.privileges, step);
    let requestForms = [];
    let showTable = false;
    let request = '';
    const verbage = ['Go back', 'Submit'];
    if (this.hasStepData()) {
      request = this.props.requests.detail.data;

      if (this.props.requests.detail.data.forms !== null) {
        requestForms = this.props.requests.detail.data.forms;
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
        label: 'Question',
        href: '/requests/question',
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

    const infoSectionStyles = {
      width: '100%',
      textAlign: 'left',
      marginTop: '16px',
      wordWrap: 'break-word',
      whiteSpace: 'normal',
    };

    const disabledButtonStyles = {
      backgroundColor: '#cccccc',
      color: '#666666',
    };

    const radioInputStyles = {
      cursor: 'pointer',
    };

    const radioLabelStyles = {
      display: 'flex',
      alignItems: 'center',
      marginRight: '15px',
    };

    return (
      <div className='page__component'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <section className='page__section'>
          <h1 className='heading--large heading--shared-content with-description width--three-quarters'>{requestId}</h1>
          {request && lastUpdated(request.last_change, 'Updated')}
        </section>
        <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium with-description'><strong>Step</strong>:&nbsp;&nbsp;&nbsp;&nbsp;{stepName}</h2>
          </div>
        </section>
        <section className='page__section'>
          <div className="mt-3" style={infoSectionStyles}>
            <h3>Does this data require additional review by a DAAC?</h3>
          </div>
          <div>
            <label style={radioLabelStyles}>
              <input type="radio" style={radioInputStyles} id="review_required_yes" onChange={() => this.setReviewState(true)} checked={this.state.requiresReview === true}/>
              <label style={{ marginLeft: '5px', marginBottom: '0px', fontSize: '1em' }} htmlFor="review_required_yes">Yes</label>
            </label>
            <label style={radioLabelStyles}>
              <input type="radio" style={radioInputStyles} id="review_required_no" onChange={() => this.setReviewState(false)} checked={this.state.requiresReview === false}/>
              <label style={{ marginLeft: '5px', marginBottom: '0px', fontSize: '1em' }} htmlFor="review_required_no">No</label>
            </label>
          </div>
        </section>
        <br />
        <br />
        <section className='page__section'>
          {showTable && typeof requestId !== 'undefined'
            ? <>
              <h2 className='heading--medium with-description heading__wrapper--border'>Request Forms</h2>
              <Table
                data={requestForms}
                dispatch={this.props.dispatch}
                tableColumns={tableColumns} /></>
            : null}
        </section>
        {canReview && (
        <section className='page__section'>
          <div className='flex__row reject-approve'>
            <div className='flex__item--spacing'>
              <button onClick={() => this.navigateBack()}
                className='button button--cancel button__animation--md button__arrow button__arrow--md button__animation button--secondary form-group__element--right'
              > {verbage[0]}
              </button>
            </div>
            <div className='flex__item--spacing'>
              <button onClick={() => this.handleSubmit()}
                className='button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white form-group__element--right'
                style={ this.state.requiresReview === null ? { ...disabledButtonStyles } : null }
                disabled= { !(this.state.requiresReview !== null) }
              > {verbage[1]}
              </button>
            </div>
          </div>
        </section>
        )}
      </div>
    );
  }
}

AdditionalReviewQuestion.propTypes = {
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
}))(AdditionalReviewQuestion));
