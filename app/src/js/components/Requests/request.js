'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  getRequest,
  // deleteRequest,
  applyWorkflowToRequest,
  listWorkflows
} from '../../actions';
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
import { strings } from '../locale';
import { workflowOptionNames } from '../../selectors';
import { simpleDropdownOption } from '../../utils/table-config/requests';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

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
    label: 'Data Publication Request',
    property: 'data_publication_request'
  },
  {
    label: 'Data Production Information',
    property: 'data_production_information'
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
  },
  {
    label: 'Communication',
    accessor: conversationId => <Link to={`/conversations/id/${conversationId}`}>{conversationId ? 'Email Conversation' : null}</Link>,
    property: 'conversation_id'
  }
];

class RequestOverview extends React.Component {
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

  componentDidMount () {
    const { requestId } = this.props.match.params;
    const { dispatch } = this.props;
    // This causes a repeating query for workflows cluttering up the logs.
    // Commenting out until we add applyWorkflow capability
    // this.cancelInterval = interval(this.queryWorkflows, updateInterval, true);
    dispatch(getRequest(requestId));
  }

  reload (immediate, timeout) {
    // timeout = timeout || updateInterval;
    // const requestId = this.props.match.params.requestId;
    // const { dispatch } = this.props;
    // if (this.cancelInterval) { this.cancelInterval(); }
    // this.cancelInterval = interval(() => dispatch(getRequest(requestId)), timeout, immediate);
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
    const { requestId } = this.props.match.params;
    const { workflow } = this.state;
    this.props.dispatch(applyWorkflowToRequest(requestId, workflow));
  }

  delete () {
    // const { requestId } = this.props.match.params;
    // this.props.dispatch(deleteRequest(requestId));
  }

  // This method is unnecessary now, it checks for any errors on any of the requests queried so far,
  // since this is a detailed view of a single request we are only concerned with an error for that one
  // so no need to relegate the error check to a separate function
  // errors () {
  //   const requestId = this.props.match.params.requestId;
  //   return [
  //     get(this.props.requests.map, [requestId, 'error']),
  //     get(this.props.requests.reprocessed, [requestId, 'error']),
  //     get(this.props.requests.reingested, [requestId, 'error']),
  //     get(this.props.requests.executed, [requestId, 'error']),
  //     get(this.props.requests.removed, [requestId, 'error']),
  //     get(this.props.requests.deleted, [requestId, 'error'])
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
    const { requestId } = this.props.match.params;
    const record = this.props.requests.detail;
    const request = record.data || false;

    /* const dropdownConfig = [{
      text: 'Delete',
      action: this.delete,
      disabled: !!request.submitted,
      status: get(this.props.requests.deleted, [requestId, 'status']),
      success: this.navigateBack,
      confirmAction: true,
      confirmText: deleteText(requestId)
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
        label: requestId,
        active: true
      }
    ];

    return (
      <div className='page__component'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>

        <section className='page__section page__section__header-wrapper'>
          <h1 className='heading--large heading--shared-content with-description width--three-quarters'>{requestId}</h1>
          {/* <AsyncCommands config={dropdownConfig} /> */}
          { request && lastUpdated(request.last_change, 'Updated') }

          <dl className='status--process'>
            <dt>Status:</dt>
            <dd className={request.status}>{request.status}</dd>
          </dl>
        </section>

        <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium with-description'>{strings.request_overview}</h2>
          </div>
          { record.inflight ? <Loading />
            : record.error ? <ErrorReport report={record.error} />
              : request ? <Metadata data={request} accessors={metaAccessors} />
                : null
          }
        </section>

        { /* <section className='page__section'>
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
            query={{ q: requestId }}
            dispatch={this.props.dispatch}
            logs={this.props.logs}
            notFound={`No recent logs for ${requestId}`}
          />
        </section> */}
      </div>
    );
  }
}

RequestOverview.propTypes = {
  match: PropTypes.object,
  dispatch: PropTypes.func,
  requests: PropTypes.object,
  logs: PropTypes.object,
  history: PropTypes.object,
  skipReloadOnMount: PropTypes.bool,
  workflowOptions: PropTypes.array
};

RequestOverview.defaultProps = {
  skipReloadOnMount: false
};

export { RequestOverview };

export default withRouter(connect(state => ({
  requests: state.requests,
  workflowOptions: workflowOptionNames(state),
  logs: state.logs
}))(RequestOverview));
