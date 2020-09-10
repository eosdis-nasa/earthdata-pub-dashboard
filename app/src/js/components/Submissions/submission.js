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
  displayCase,
  lastUpdated,
  nullValue,
  bool,
  dataProducerLink,
  pointOfContactLink,
  deleteText
} from '../../utils/format';
import Table from '../SortableTable/SortableTable';
import Loading from '../LoadingIndicator/loading-indicator';
import LogViewer from '../Logs/viewer';
import ErrorReport from '../Errors/report';
import Metadata from '../Table/Metadata';
import AsyncCommands from '../DropDown/dropdown-async-command';
import _config from '../../config';
import { strings } from '../locale';
import { workflowOptionNames } from '../../selectors';
import { simpleDropdownOption } from '../../utils/table-config/submissions';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

const { updateInterval } = _config;

const link = 'Link';

const makeLink = (bucket, key) => {
  return `https://${bucket}.s3.amazonaws.com/${key}`;
};

const tableColumns = [
  {
    Header: 'Submission',
    accessor: row => row.fileName || '(No name)',
    id: 'Submission'
  },
  {
    Header: 'Link',
    accessor: row => (row.bucket && row.key) ? (<a href={makeLink(row.bucket, row.key)}>{row.fileName ? link : nullValue}</a>) : null,
    id: 'link'
  },
  {
    Header: 'Bucket',
    accessor: 'bucket'
  }
];

const metaAccessors = [
  {
    label: 'Primary Data Producer',
    property: 'dataProducer',
    accessor: dataProducerLink
  },
  {
    label: 'Primary Contact',
    property: 'contact',
    accessor: pointOfContactLink
  },
  {
    label: 'Submitted',
    property: 'submitted',
    accessor: bool
  },
  {
    label: 'Duplicate',
    property: 'hasDuplicate',
    accessor: bool
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
    this.errors = this.errors.bind(this);
    this.selectWorkflow = this.selectWorkflow.bind(this);
    this.getExecuteOptions = this.getExecuteOptions.bind(this);
    this.displayName = strings.submission;
    this.state = {};
  }

  componentDidMount () {
    const { submissionId } = this.props.match.params;
    this.cancelInterval = interval(this.queryWorkflows, updateInterval, true);

    if (this.props.skipReloadOnMount) return;

    const immediate = !this.props.submissions.map[submissionId];
    this.reload(immediate);
  }

  componentWillUnmount () {
    if (this.cancelInterval) { this.cancelInterval(); }
  }

  reload (immediate, timeout) {
    timeout = timeout || updateInterval;
    const submissionId = this.props.match.params.submissionId;
    const { dispatch } = this.props;
    if (this.cancelInterval) { this.cancelInterval(); }
    this.cancelInterval = interval(() => dispatch(getSubmission(submissionId)), timeout, immediate);
  }

  fastReload () {
    // decrease timeout to better see updates
    this.reload(true, updateInterval / 2);
  }

  navigateBack () {
    const { history } = this.props;
    history.push('/submissions');
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

  errors () {
    const submissionId = this.props.match.params.submissionId;
    return [
      get(this.props.submissions.map, [submissionId, 'error']),
      get(this.props.submissions.reprocessed, [submissionId, 'error']),
      get(this.props.submissions.reingested, [submissionId, 'error']),
      get(this.props.submissions.executed, [submissionId, 'error']),
      get(this.props.submissions.removed, [submissionId, 'error']),
      get(this.props.submissions.deleted, [submissionId, 'error'])
    ].filter(Boolean);
  }

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
    const submissionId = this.props.match.params.submissionId;
    const record = this.props.submissions.map[submissionId];
    if (!record || (record.inflight && !record.data)) {
      return <Loading />;
    } else if (record.error) {
      return <ErrorReport report={record.error} />;
    }

    const submission = record.data;
    const files = [];
    if (submission.files) {
      for (const key in get(submission, 'files', {})) { files.push(submission.files[key]); }
    }
    const dropdownConfig = [{
      text: 'Delete',
      action: this.delete,
      disabled: !!submission.submitted,
      status: get(this.props.submissions.deleted, [submissionId, 'status']),
      success: this.navigateBack,
      confirmAction: true,
      confirmText: deleteText(submissionId)
    }];
    const errors = this.errors();

    const breadcrumbConfig = [
      {
        label: 'Dashboard Home',
        href: '/'
      },
      {
        label: 'Submissions',
        href: '/submissions'
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
          <AsyncCommands config={dropdownConfig} />
          {lastUpdated(submission.updatedAt, 'Updated')}

          <dl className='status--process'>
            <dt>Status:</dt>
            <dd className={submission.status.toLowerCase()}>{displayCase(submission.status)}</dd>
          </dl>
        </section>

        <section className='page__section'>
          {errors.length ? <ErrorReport report={errors} /> : null}
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium with-description'>{strings.submission_overview}</h2>
          </div>
          <Metadata data={submission} accessors={metaAccessors} />
        </section>

        <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>Files</h2>
          </div>
          <Table
            data={files}
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
        </section>
      </div>
    );
  }
}

SubmissionOverview.propTypes = {
  match: PropTypes.object,
  dispatch: PropTypes.func,
  submissions: PropTypes.object,
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
  submissions: state.submissions,
  workflowOptions: workflowOptionNames(state),
  logs: state.logs
}))(SubmissionOverview));
