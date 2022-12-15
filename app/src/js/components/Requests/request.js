'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  getRequest,
  getDaac,
  getUser,
  getWorkflow,
  withdrawRequest,
  restoreRequest,
  addUserToRequest,
  removeUserFromRequest,
  listWorkflows,
  setWorkflowStep
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
import Metadata from '../Table/Metadata';
import AsyncCommands from '../DropDown/dropdown-async-command';
import { strings } from '../locale';
import { workflowOptionNames } from '../../selectors';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { requestPrivileges, formPrivileges } from '../../utils/privileges';
import _config from '../../config';
import Meditor from '../MeditorModal/modal';
import SearchModal from '../SearchModal';
import Select from 'react-select';

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
    this.state = { daacName: '', current: {}, names: {} };
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
    this.setSteps = this.setSteps.bind(this);
    this.toProperCase = this.toProperCase.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
  }

  componentDidMount () {
    const { dispatch } = this.props;
    const { requestId } = this.props.match.params;
    // This causes a repeating query for workflows cluttering up the logs.
    // Commenting out until we add applyWorkflow capability
    // this.cancelInterval = interval(this.queryWorkflows, updateInterval, true);
    dispatch(getRequest(requestId));
    this.setState({ showSearch: false });
    this.setState({ setShowSearch: false });
    setTimeout(() => {
      const record = this.props.requests.detail;
      if (typeof record.data !== 'undefined') {
        this.props.dispatch(getDaac(record.data.daac_id)).then(value => {
          this.setState({ daacName: value.data.long_name });
        });
        this.props.dispatch(getWorkflow(record.data.workflow_id)).then(value => {
          this.setSteps(value.data.steps, record.data.step_name);
        });
        if (record.data.contributor_ids !== undefined) {
          for (const ea in record.data.contributor_ids) {
            this.props.dispatch(getUser(record.data.contributor_ids[ea])).then(value => {
              const names = this.state.names;
              names[value.data.id] = value.data.name;
              this.setState({ names: names });
            });
          }
        }
      }
    }, 1500);
  }

  toProperCase (str) {
    return str.replace(
      /\w\S*/g,
      function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  }

  setSteps (steps, current) {
    const tmp = [];
    for (const ea in steps) {
      if (ea === current) {
        this.setState({ current: { value: ea, label: this.toProperCase(ea.replace(/_/g, ' ')) } });
      }
      tmp.push({ value: ea, label: this.toProperCase(ea.replace(/_/g, ' ')) });
    }
    this.setState({ steps: tmp });
  }

  handleSelect (e, stepName) {
    this.setState({ current: e });
    if (JSON.stringify(this.state.current) !== JSON.stringify(e) && stepName !== e.value) {
      document.querySelector('.save-section').classList.remove('hidden');
    } else {
      document.querySelector('.save-section').classList.add('hidden');
    }
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

  async handleSubmit () {
    const { requestId } = this.props.match.params;
    const record = this.props.requests.detail;
    const payload = {
      id: requestId,
      workflow_id: record.data.workflow_id,
      step_name: this.state.current.value
    };
    await this.props.dispatch(setWorkflowStep(payload));
    await this.props.dispatch(getRequest(requestId));
    document.querySelector('.save-section').classList.add('hidden');
  }

  async handleRemove (contributor) {
    const { requestId } = this.props.match.params;
    await this.props.dispatch(removeUserFromRequest(requestId, contributor));
    await this.props.dispatch(getRequest(requestId));
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

  async exportMetadata () {
    const mappedData = JSON.stringify(this.props.requests.detail.data.metadata, null, 2);
    const a = document.createElement('a');
    const file = new Blob([mappedData], { type: 'application/json' });
    a.href = URL.createObjectURL(file);
    a.download = `${this.props.requests.detail.data.id}`;
    a.click();
  }

  selectWorkflow (selector, workflow) {
    this.setState({ workflow });
  }

  async submitCallback (id) {
    const { requestId } = this.props.match.params;
    const payload = {
      id: requestId,
      contributor_ids: [id]
    };
    await this.props.dispatch(addUserToRequest(payload));
    await this.closeUserForm();
    await window.location.reload(false);
  }

  renderWorkflowSave (record) {
    return (
      <>
        <br></br>
        <div className='page__section__header'>
          <h1 className='heading--small' aria-labelledby='Set the current workflow step'>
            Set the current workflow step
          </h1>
        </div>
        <div className='indented__details'>
          <div className="request-section">
            <Select
              id="workflowSelect"
              options={this.state.steps}
              onChange={(e) => this.handleSelect(e, record.data.step_name)}
              isSearchable={true}
              value={this.state.current}
              placeholder='Set Current Workflow Step'
              className='selectButton'
              isMulti={false} />
          </div>
          <br></br>
          <section className='page__section save-section hidden'>
            <button className={'button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'}
              onClick={this.handleSubmit} aria-label="change workflow step">
              Save
            </button>
          </section>
        </div>
      </>
    );
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
    let workflowSave;
    if (canWithdraw && canRestore) {
      workflowSave = this.renderWorkflowSave(record);
    }
    const allRoles = getRoles();
    let canViewUsers = false;
    let canAddDataUser = false;
    if (typeof allRoles !== 'undefined' && allRoles.isAdmin) {
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
        label: 'Data Producer Name',
        accessor: row => row.form_data && row.form_data.data_producer_info_name ? row.form_data.data_producer_info_name : null
      },
      {
        label: 'Daac',
        accessor: row => this.state.daacName && canEdit ? <a href={`${_config.formsUrl}/daacs/selection?requestId=${row.id}`} aria-label="View daac selection">{this.state.daacName}</a> : this.state.daacName ? this.state.daacName : row.daac_id,
        classList: 'hidden'
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
            <h1 className='heading--small' aria-labelledby={strings.request_overview}>
              {strings.request_overview}
            </h1>
          </div>
          { record.inflight ? <Loading /> : request ? <div className='indented__details'><Metadata data={request} accessors={metaAccessors} /></div> : null }
        </section>
        <section className='page__section'>
          <br></br>
          <div className='page__section__header'>
            <h1 className='heading--small' aria-labelledby='contributers'>
              Contributors
            </h1>
          </div>
          <div className='page__content--shortened flex__column'>
            {
              record.data && record.data.contributor_ids
                ? record.data.contributor_ids.map((contributor, key) => {
                  return (
                  <div key={key} className='flex__row sm-border'>
                    <div className='flex__item--w-25'>
                      {this.state.names[contributor]}
                    </div>
                    <div className='flex__item--w-15'>
                      {canAddDataUser &&
                        <button
                          className='button button--remove button__animation--md button__arrow button__arrow--md button__animation'
                          onClick={(e) => this.handleRemove(contributor)}
                          disabled={record.inflight}>
                          Remove
                        </button>
                      }
                    </div>
                  </div>
                  );
                })
                : null
            }
            { record.data && record.data.contributor_ids
              ? canAddDataUser &&
              <div className='flex__row sm-border'>
                <div className='flex__item-w-25'>
                  <button
                    className='button button--add button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'
                    onClick={this.openUserForm}
                    disabled={record.inflight}>
                    Add Contributor&nbsp;&nbsp;
                  </button>
                </div>
              </div>
              : null
            }
          </div>
          </section>
          {
            !record.inflight
              ? <section className='page__section'>
              {workflowSave}
            </section>
              : null
          }
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
