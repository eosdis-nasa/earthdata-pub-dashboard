'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  getRequest,
  getDaac,
  withdrawRequest,
  restoreRequest,
  addUserToRequest,
  listWorkflows
} from '../../actions';
import { get } from 'object-path';
import {
  // displayCase,
  lastUpdated,
  shortDateNoTimeYearFirst,
  shortDateShortTimeYearFirst,
  bool,
  deleteTextWithType
} from '../../utils/format';
import Table from '../SortableTable/SortableTable';
import {
  stepLookup
} from '../../utils/table-config/requests';
import Loading from '../LoadingIndicator/loading-indicator';
// import LogViewer from '../Logs/viewer';
import ErrorReport from '../Errors/report';
import Metadata from '../Table/Metadata';
import AsyncCommands from '../DropDown/dropdown-async-command';
import { strings } from '../locale';
import { workflowOptionNames } from '../../selectors';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { requestPrivileges, formPrivileges } from '../../utils/privileges';
import _config from '../../config';
import Meditor from '../MeditorModal/modal';
import SearchModal from '../SearchModal';

export const getRoles = () => {
  const user = JSON.parse(window.localStorage.getItem('auth-user'));
  if (user != null) {
    const roles = user.user_roles;
    const privileges = user.user_privileges;
    const allRoles = {
      isManager: privileges.find(o => o.match(/ADMIN/g))
        ? privileges.find(o => o.match(/ADMIN/g))
        : roles.find(o => o.short_name.match(/manager/g)),
      isAdmin: privileges.find(o => o.match(/ADMIN/g)),
    };
    return allRoles;
  }
};

class RequestOverview extends React.Component {
  constructor () {
    super();
    this.state = { daacName: '' };
    this.reload = this.reload.bind(this);
    this.fastReload = this.fastReload.bind(this);
    this.navigateBack = this.navigateBack.bind(this);
    this.queryWorkflows = this.queryWorkflows.bind(this);
    //  this.reingest = this.reingest.bind(this);
    this.applyWorkflow = this.applyWorkflow.bind(this);
    //  this.remove = this.remove.bind(this);
    this.delete = this.delete.bind(this);
    this.restore = this.restore.bind(this);
    this.selectWorkflow = this.selectWorkflow.bind(this);
    this.displayName = strings.request;
    this.exportMetadata = this.exportMetadata.bind(this);
    this.submitCallback = this.submitCallback.bind(this);
    this.openUserForm = this.openUserForm.bind(this);
    this.closeUserForm = this.closeUserForm.bind(this);
    this.addUser = this.addUser.bind(this);
  }

  componentDidMount () {
    const { dispatch } = this.props;
    const { requestId } = this.props.match.params;
    // This causes a repeating query for workflows cluttering up the logs.
    // Commenting out until we add applyWorkflow capability
    // this.cancelInterval = interval(this.queryWorkflows, updateInterval, true);
    dispatch(getRequest(requestId));
    setTimeout(() => {
      const record = this.props.requests.detail;
      if (typeof record.data !== 'undefined') {
        this.props.dispatch(getDaac(record.data.daac_id)).then(value => {
          this.setState({ daacName: value.data.long_name });
          this.setState({ showSearch: false });
          this.setState({ setShowSearch: false });
        });
      }
    }, 2000);
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
    const { history } = this.props;
    history.push(`/workflows?requestId=${requestId}`);
  }

  async delete () {
    const { requestId } = this.props.match.params;
    await this.props.dispatch(withdrawRequest(requestId));
    this.navigateBack();
  }

  async restore () {
    const { requestId } = this.props.match.params;
    await this.props.dispatch(restoreRequest(requestId));
    this.navigateBack();
  }

  async openUserForm () {
    this.setState({ showSearch: true });
  }

  async closeUserForm () {
    this.setState({ showSearch: false });
  }

  async addUser () {
    const { requestId } = this.props.match.params;
    const { userId } = this.props.match.params;
    await this.props.dispatch(addUserToRequest(requestId, userId));
    this.navigateBack();
  }

  async exportMetadata () {
    const mappedData = JSON.stringify(this.props.requests.detail.data.metadata, null, 2);
    const a = document.createElement('a');
    const file = new Blob([mappedData], { type: 'application/json' });
    a.href = URL.createObjectURL(file);
    a.download = `${this.props.requests.detail.data.id}`;
    a.click();
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

  submitCallback () {
    const { requestId } = this.props.match.params;
    const { userId } = this.props.match.params;
    const params = {
      requestId: requestId,
      userId: userId
    };
    this.props.dispatch(addUserToRequest(params));
    this.setState({ setShowSearch: false });
  }

  render () {
    const { requestId } = this.props.match.params;
    const record = this.props.requests.detail;
    const searchOptions = {
      entity: 'user',
      submit: this.submitCallback,
      cancel: this.closeUserForm
    };
    let isHidden = false;
    if (typeof record.data !== 'undefined') {
      isHidden = record.data.hidden;
    }
    const request = record.data || false;
    let { canReassign, canWithdraw, canRestore } = requestPrivileges(this.props.privileges);
    if (typeof request.step_name !== 'undefined' && request.step_name.match(/assign_a_workflow/g)) {
      canReassign = false;
    }
    const { canEdit } = formPrivileges(this.props.privileges);
    const allRoles = getRoles();
    let canViewUsers = false;
    let canAddDataUser = false;
    if (typeof allRoles !== 'undefined' && (allRoles.isAdmin || allRoles.isManager)) {
      canViewUsers = true;
      canAddDataUser = true;
    }
    const requestForms = request.forms;
    let showTable = false;
    if (requestForms !== null &&
      typeof requestForms !== 'undefined') {
      if (requestForms.length > 1) {
        showTable = true;
      }
    }
    const deleteStatus = get(this.props.requests.deleted, [requestId, 'status']);
    const openStatus = get(this.props.requests.openStatus, [requestId, 'status']);
    let dropdownConfig = [];

    if (!isHidden) {
      dropdownConfig = [
        {
          text: `${_config.requestHideButtonVerbage}`,
          action: this.delete,
          status: deleteStatus,
          success: this.navigateBack,
          confirmAction: true,
          confirmText: deleteTextWithType(requestId, 'request')
        }
      ];
    }

    if (canReassign && !isHidden) {
      dropdownConfig.push({
        text: 'Reassign Workflow',
        action: this.applyWorkflow,
        status: openStatus,
        success: this.navigateBack,
        confirmAction: false
      });
    }

    if (canRestore && isHidden) {
      dropdownConfig.push({
        text: 'Restore Request',
        action: this.restore,
        status: openStatus,
        success: this.navigateBack,
        confirmAction: false
      });
    }

    if (canAddDataUser && !isHidden) {
      dropdownConfig.push({
        text: 'Add User to Request',
        action: this.openUserForm,
        status: openStatus,
        success: this.navigateBack,
        confirmAction: false
      });
    }

    dropdownConfig.push({
      text: 'Export Metadata',
      action: this.exportMetadata,
      status: openStatus,
      success: this.navigateBack,
      confirmAction: false
    });

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

    const metaAccessors = [
      {
        label: 'Daac',
        accessor: row => this.state.daacName && canEdit ? <a href={`${_config.formsUrl}/daacs/selection?requestId=${row.id}`} aria-label="View daac selection">{this.state.daacName}</a> : this.state.daacName ? this.state.daacName : row.daac_id
      },
      {
        label: 'Initiator',
        accessor: row => row.initiator.name && canViewUsers ? <Link to={`/users/id/${row.initiator.id}`} aria-label="View request creator">{row.initiator.name}</Link> : row.initiator.name
      },
      {
        label: 'Data Product Name',
        accessor: row => row.form_data && row.form_data.data_product_name_value ? row.form_data.data_product_name_value : 'Request Initialized'
      },
      {
        label: 'Workflow',
        accessor: row => canReassign && row.workflow_name ? <Link to={`/workflows/id/${row.workflow_id}`} aria-label="View your workflows">{row.workflow_name}</Link> : row.workflow_name
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
        accessor: conversationId => <Link to={`/conversations/id/${conversationId}`} aria-label="View your conversations">{conversationId ? 'Conversation' : null}</Link>,
        property: 'conversation_id'
      }
    ];

    if (!isHidden) {
      metaAccessors.push(
        {
          label: 'Next Action',
          accessor: row => stepLookup(row)
        }
      );
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
          { this.state.showSearch && <SearchModal { ...searchOptions }/> }
          { canWithdraw || canRestore ? <AsyncCommands config={dropdownConfig} /> : null }
          { request && lastUpdated(request.last_change, 'Updated') }
          <dl className='status--process'>
            <dt>Status:</dt>
            <dd className={request.status}>{request.status}</dd>
          </dl>
        </section>

        <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium with-description' aria-label={strings.request_overview}>{strings.request_overview}</h2>
          </div>
          { record.inflight ? <Loading /> : record.error ? <ErrorReport report={record.error} /> : request ? <Metadata data={request} accessors={metaAccessors} /> : null }
        </section>
        <Meditor></Meditor>
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
  daacs: PropTypes.object,
  roles: PropTypes.array
};

RequestOverview.defaultProps = {
  skipReloadOnMount: false
};

export { RequestOverview };

export default withRouter(connect(state => ({
  requests: state.requests,
  workflowOptions: workflowOptionNames(state),
  logs: state.logs,
  privileges: state.api.tokens.privileges,
  roles: state.api.tokens.roles,
}))(RequestOverview));
