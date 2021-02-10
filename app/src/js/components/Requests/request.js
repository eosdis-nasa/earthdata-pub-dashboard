'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  interval,
  getSubmission,
  deleteSubmission,
  applyWorkflowToSubmission,
  listWorkflows
} from '../../actions';
import { get } from 'object-path';
import {
  // displayCase,
  lastUpdated,
  shortDateNoTimeYearFirst,
  bool,
  // deleteText
} from '../../utils/format';
// import Table from '../SortableTable/SortableTable';
import Loading from '../LoadingIndicator/loading-indicator';
// import LogViewer from '../Logs/viewer';
import ErrorReport from '../Errors/report';
import Metadata from '../Table/Metadata';
// import AsyncCommands from '../DropDown/dropdown-async-command';
import _config from '../../config';
import { strings } from '../locale';
import { workflowOptionNames } from '../../selectors';
import { simpleDropdownOption } from '../../utils/table-config/requests';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

const { updateInterval } = _config;

/* const tableColumns = [

]; */

const metaAccessors = [
  {
    label: 'Workflow',
    property: 'workflow_name'
  },
  {
    label: 'Step',
    property: 'step_name'
  },
  {
    label: 'Created',
    accessor: d => {
      return (shortDateNoTimeYearFirst(d));
    },
    property: 'created_at'
  },
  {
    label: 'Latest Edit',
    accessor: d => {
      return (shortDateNoTimeYearFirst(d));
    },
    property: 'last_change'
  },
  {
    label: 'Locked',
    accessor: row => bool(row.lock),
    property: 'lock'
  }
];

class SubmissionOverview extends React.Component {
  constructor () {
    super();
    this.reload = this.reload.bind(this);
    this.fastReload = this.fastReload.bind(this);
    this.navigateBack = this.navigateBack.bind(this);
    this.queryWorkflows = this.queryWorkflows.bind(this);
    //  this.reingest = this.reingest.bind(this);
    this.applyWorkflow = this.applyWorkflow.bind(this);
    //  this.remove = this.remove.bind(this);
    this.delete = this.delete.bind(this);
    this.selectWorkflow = this.selectWorkflow.bind(this);
    this.getExecuteOptions = this.getExecuteOptions.bind(this);
    this.displayName = strings.request;
    this.state = {};
  }

  componentWillMount () {
    const { submissionId } = this.props.match.params;
    const { dispatch } = this.props;
    //This causes a repeating query for workflows cluttering up the logs.
    //Commenting out until we add applyWorkflow capability
    //this.cancelInterval = interval(this.queryWorkflows, updateInterval, true);
    dispatch(getSubmission(submissionId));
  }

  componentWillUnmount () {
    //if (this.cancelInterval) { this.cancelInterval(); }
  }

  reload (immediate, timeout) {
    // timeout = timeout || updateInterval;
    // const submissionId = this.props.match.params.submissionId;
    // const { dispatch } = this.props;
    // if (this.cancelInterval) { this.cancelInterval(); }
    // this.cancelInterval = interval(() => dispatch(getSubmission(submissionId)), timeout, immediate);
  }

  fastReload () {
    // decrease timeout to better see updates
    // this.reload(true, updateInterval / 2);
  }

  navigateBack () {
    const { history } = this.props;
    history.push('/requests');
  }

  queryWorkflows () {
    this.props.dispatch(listWorkflows());
  }

  applyWorkflow () {
    const { submissionId } = this.props.match.params;
    const { workflow } = this.state;
    this.props.dispatch(applyWorkflowToSubmission(submissionId, workflow));
  }

  delete () {
    const { submissionId } = this.props.match.params;
    this.props.dispatch(deleteSubmission(submissionId));
  }

  // This method is unnecessary now, it checks for any errors on any of the submissions queried so far,
  // since this is a detailed view of a single submission we are only concerned with an error for that one
  // so no need to relegate the error check to a separate function
  // errors () {
  //   const submissionId = this.props.match.params.submissionId;
  //   return [
  //     get(this.props.requests.map, [submissionId, 'error']),
  //     get(this.props.requests.reprocessed, [submissionId, 'error']),
  //     get(this.props.requests.reingested, [submissionId, 'error']),
  //     get(this.props.requests.executed, [submissionId, 'error']),
  //     get(this.props.requests.removed, [submissionId, 'error']),
  //     get(this.props.requests.deleted, [submissionId, 'error'])
  //   ].filter(Boolean);
  // }

  selectWorkflow (selector, workflow) {
    this.setState({ workflow });
  }

  getExecuteOptions () {
    return [
      simpleDropdownOption({
        handler: this.selectWorkflow,
        label: 'workflow',
        value: this.state.workflow,
        options: this.props.workflowOptions
      })
    ];
  }

  render () {
    const { dispatch } = this.props;
    const { submissionId } = this.props.match.params;
    const record = this.props.requests.detail;
    const request = record.data || false;

    /* const dropdownConfig = [{
      text: 'Delete',
      action: this.delete,
      disabled: !!request.submitted,
      status: get(this.props.requests.deleted, [submissionId, 'status']),
      success: this.navigateBack,
      confirmAction: true,
      confirmText: deleteText(submissionId)
    }]; */

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
        label: submissionId,
        active: true
      }
    ];

    return (
      <div className='page__component'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>

        <section className='page__section page__section__header-wrapper'>
          <h1 className='heading--large heading--shared-content with-description width--three-quarters'>{submissionId}</h1>
          {/* <AsyncCommands config={dropdownConfig} /> */}
          { request && lastUpdated(request.last_change, 'Updated') }

          <dl className='status--process'>
            <dt>Status:</dt>
            <dd className={request.status}>{request.status}</dd>
          </dl>
        </section>

        <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium with-description'>{strings.submission_overview}</h2>
          </div>
          { record.inflight ? <Loading /> :
            record.error ? <ErrorReport report={record.error} /> :
            request ? <Metadata data={request} accessors={metaAccessors} /> :
            null
          }
        </section>

        { /*<section className='page__section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>Files</h2>
          </div>
          <Table
            data={[]}
            tableColumns={tableColumns}
          />
        </section>

        <section className='page__section'>
          <LogViewer
            query={{ q: submissionId }}
            dispatch={this.props.dispatch}
            logs={this.props.logs}
            notFound={`No recent logs for ${submissionId}`}
          />
        </section> */}
      </div>
    );
  }
}

SubmissionOverview.propTypes = {
  match: PropTypes.object,
  dispatch: PropTypes.func,
  requests: PropTypes.object,
  logs: PropTypes.object,
  history: PropTypes.object,
  skipReloadOnMount: PropTypes.bool,
  workflowOptions: PropTypes.array
};

SubmissionOverview.defaultProps = {
  skipReloadOnMount: false
};

export { SubmissionOverview };

export default withRouter(connect(state => ({
  requests: state.requests,
  workflowOptions: workflowOptionNames(state),
  logs: state.logs
}))(SubmissionOverview));
