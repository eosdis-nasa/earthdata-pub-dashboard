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
  shortDateShortTimeYearFirst,
  bool,
  // deleteText
} from '../../utils/format';
import Table from '../SortableTable/SortableTable';
import Loading from '../LoadingIndicator/loading-indicator';
// import LogViewer from '../Logs/viewer';
import ErrorReport from '../Errors/report';
import Metadata from '../Table/Metadata';
// import AsyncCommands from '../DropDown/dropdown-async-command';
import { strings } from '../locale';
import { workflowOptionNames } from '../../selectors';
import { simpleDropdownOption } from '../../utils/table-config/requests';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { requestPrivileges } from '../../utils/privileges';
import _config from '../../config';

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

  newFormLink (request, formalName) {
    return <a href={request} className='button button--small button--green form-group__element--left button--no-icon'>{formalName}</a>;
  }

  existingFormLink (row, formId, formalName) {
    return <Link to={`/forms/id/${formId}?requestId=${row.id}`} className='button button--small button--green form-group__element--left button--no-icon'>{formalName}</Link>;
  }

  getFormalName (str) {
    if (typeof str === 'undefined') {
      return ' ';
    } else {
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
  }

  stepLookup (row) {
    const stepName = row.step_name;
    let request = '';
    let stepID = '';
    let stepType = '';
    let stepIDKey = '';
    let tmpType = '';
    const formalName = this.getFormalName(stepName);
    for (const i in row.step_data) {
      if (typeof row.step_data[i] !== 'undefined') {
        const regex = new RegExp(stepName, 'g');
        if (i.match('name') && row.step_data[i].match(regex)) {
          stepType = row.step_data.type;
          stepIDKey = `${stepType}_id`;
          stepID = row.step_data[stepIDKey];
          if (typeof stepID === 'undefined' && typeof row.step_data.data !== 'undefined') {
            tmpType = row.step_data.data.type;
            const tmpIDKey = `${tmpType}_id`;
            stepID = row.step_data.data[tmpIDKey];
            // Build url to forms app - after submitted
            if (tmpType.match(/form/g)) {
              request = `${_config.formsUrl}?formId=${stepID}&requestId=${row.id}&group=${row.daac_id}`;
            }
          }
          // Build url to forms app
          if (stepType.match(/form/g)) {
            request = `${_config.formsUrl}?formId=${stepID}&requestId=${row.id}&group=${row.daac_id}`;
          }
          break;
        }
      }
    }
    if (stepType.match(/review/g)) {
      return this.existingFormLink(row, stepID, formalName);
    } else {
      return this.newFormLink(request, formalName);
    }
  }

  render () {
    const { requestId } = this.props.match.params;
    const record = this.props.requests.detail;
    const request = record.data || false;
    const { canReassign } = requestPrivileges(this.props.privileges);
    const requestForms = request.forms;
    let showTable = false;
    if (typeof requestForms !== 'undefined') {
      if (requestForms.length > 1) {
        showTable = true;
      }
    }
    const tableColumns = [
      {
        Header: 'Name',
        accessor: row => <Link to={`/forms/id/${row.id}?requestId=${request.id}`}>{row.long_name}</Link>,
        id: 'long_name'
      },
      {
        Header: 'Submitted at',
        accessor: row => shortDateShortTimeYearFirst(row.submitted_at),
        id: 'submitted_at'
      }
    ];

    const metaAccessors = [
      {
        label: 'Data Product Name',
        accessor: row => row.form_data && row.form_data.data_product_name_value ? row.form_data.data_product_name_value : '(no name)'
      },
      {
        label: 'Workflow',
        accessor: row => canReassign ? <Link to={{ pathname: `/workflows/id/${row.workflow_id}` }}>{row.workflow_name}</Link> : row.workflow_name
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
        accessor: row => row && row.lock ? bool(row.lock) : null,
        property: 'lock'
      },
      {
        label: 'Communication',
        accessor: conversationId => <Link to={`/conversations/id/${conversationId}`}>{conversationId ? 'Email Conversation' : null}</Link>,
        property: 'conversation_id'
      },
      {
        label: 'Next Action',
        accessor: row => this.stepLookup(row)
      }
    ];

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

        <section className='page__section'>
          <h1 className='heading--large heading--shared-content with-description width--three-quarters'>{requestId}</h1>
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
          { record.inflight ? <Loading /> : record.error ? <ErrorReport report={record.error} /> : request ? <Metadata data={request} accessors={metaAccessors} /> : null
          }
        </section>

        { showTable
          ? <section className='page__section'>
            <div className='heading__wrapper--border'>
              <h2 className='heading--medium heading--shared-content with-description'>Request Forms</h2>
            </div>
            <Table
              data={requestForms}
              dispatch={this.props.dispatch}
              tableColumns={tableColumns}
            />
          </section>
          : null }
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
  workflowOptions: PropTypes.array,
  privileges: PropTypes.object,
};

RequestOverview.defaultProps = {
  skipReloadOnMount: false
};

export { RequestOverview };

export default withRouter(connect(state => ({
  requests: state.requests,
  workflowOptions: workflowOptionNames(state),
  logs: state.logs,
  privileges: state.api.tokens.privileges
}))(RequestOverview));
