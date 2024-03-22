'use strict';
import React from 'react';
import { get } from 'object-path';
import { Link } from 'react-router-dom';
import {
  shortDateNoTimeYearFirst,
  nullValue,
  fromNow,
  requestLink,
} from '../format';
import {
  deleteRequest
} from '../../actions';
import ErrorReport from '../../components/Errors/report';
import Dropdown from '../../components/DropDown/simple-dropdown';
import _config from '../../config';
import { trigger } from '../../actions/events';

export const getPrivileges = () => {
  const user = JSON.parse(window.localStorage.getItem('auth-user'));
  if (user != null) {
    const roles = user.user_roles;
    const privileges = user.user_privileges;
    const allPrivs = {
      isManager: privileges.find(o => o.match(/ADMIN/g))
        ? privileges.find(o => o.match(/ADMIN/g))
        : roles.find(o => o.short_name.match(/manager/g)),
      isAdmin: privileges.find(o => o.match(/ADMIN/g)),
      isProducer: privileges.find(o => o.match(/ADMIN/g))
        ? privileges.find(o => o.match(/ADMIN/g))
        : roles.find(o => o.short_name.match(/data_producer/g)),
      isStaff: privileges.find(o => o.match(/ADMIN/g))
        ? privileges.find(o => o.match(/ADMIN/g))
        : roles.find(o => o.short_name.match(/staff/g)),
      canReview: privileges.find(o => o.match(/ADMIN/g))
        ? privileges.find(o => o.match(/ADMIN/g))
        : privileges.find(o => o.match(/REQUEST_REVIEW/g)),
      canReassign: privileges.find(o => o.match(/ADMIN/g))
        ? privileges.find(o => o.match(/ADMIN/g))
        : privileges.find(o => o.match(/REQUEST_REASSIGN/g)),
      canCreateForm: privileges.find(o => o.match(/ADMIN/g))
        ? privileges.find(o => o.match(/ADMIN/g))
        : privileges.find(o => o.match(/FORM_CREATE/g)),
      canUpdateForm: privileges.find(o => o.match(/ADMIN/g))
        ? privileges.find(o => o.match(/ADMIN/g))
        : privileges.find(o => o.match(/FORM_UPDATE/g))
    };
    return allPrivs;
  }
};

export const newLink = (request, formalName) => {
  const allPrivs = getPrivileges();
  let disabled = false;
  if (typeof allPrivs !== 'undefined' && allPrivs.canUpdateForm) {
    disabled = false;
  } else {
    disabled = true;
  }
  const isDetailPage = location.href.match(/id/g);
  if (isDetailPage === null && disabled) {
    return <Link to={''} className={'button button--medium button--clear form-group__element--left button--no-icon next-action'} aria-label={formalName}>{formalName}</Link>;
  } else if (disabled) {
    return formalName;
  } else {
    // This element was purposefully left as an anchor tag (rather than react Link) since the page is redirected away from
    // the dashboard site to the forms site. Converting to a Link component will result in a malformed url.
    return <a href={request} className={'button button--medium button--green form-group__element--left button--no-icon next-action'} aria-label={formalName || 'take action'}>{formalName}</a>;
  }
};

export const sendToMeditor = (row, step, request, formalName) => {
  const allPrivs = getPrivileges();
  let disabled = false;
  if (typeof allPrivs.isManager !== 'undefined' || typeof allPrivs.isCoordinator !== 'undefined' || typeof allPrivs.isAdmin !== 'undefined') {
    disabled = false;
  } else {
    disabled = true;
  }
  const isDetailPage = location.href.match(/id/g);
  if (isDetailPage === null && disabled) {
    return <Link to={'#'} className={'button button--medium button--clear form-group__element--left button--no-icon next-action'} aria-label={formalName}>{formalName}</Link>;
  } else if (disabled) {
    return formalName;
  } else {
    return <Link className={'button button--medium button--green form-group__element--left button--no-icon'}
    onClick={() => { trigger('sendToMeditor:click', { request: request, link: `${window.location.origin}${window.location.pathname.split(/\/requests/)[0]}/requests/approval?requestId=${row.id}&step=${step}` }); }} id={'sendButton'} to={'#'} name={'sendButton'} aria-label={formalName || 'send to meditor'}>{formalName}</Link>;
  }
};

export const assignWorkflow = (request, formalName) => {
  const allPrivs = getPrivileges();
  let disabled = false;
  if (typeof allPrivs !== 'undefined' && (typeof allPrivs.isManager !== 'undefined' || typeof allPrivs.isAdmin !== 'undefined' || typeof allPrivs.isStaff !== 'undefined' || typeof allPrivs.canReassign !== 'undefined')) {
    disabled = false;
  } else {
    disabled = true;
  }
  const isDetailPage = location.href.match(/id/g);
  if (isDetailPage === null && disabled) {
    return <Link to={'#'} className={'button button--medium button--clear form-group__element--left button--no-icon assign-workflow'} aria-label={formalName}>{formalName}</Link>;
  } else if (disabled) {
    return formalName;
  } else {
    return <Link className={'button button--medium button--green form-group__element--left button--no-icon assign-workflow'}
               to={`${request}`} name={'assignButton'} aria-label={formalName || 'assign workflow'}>{formalName}</Link>;
  }
};

export const existingLink = (row, formId, formalName, step, stepType) => {
  const allPrivs = getPrivileges();
  let disabled = false;
  if (typeof allPrivs !== 'undefined' && allPrivs.canReview) {
    disabled = false;
  } else {
    disabled = true;
  }
  const isDetailPage = location.href.match(/id/g);
  if (isDetailPage === null && disabled) {
    return <Link to={''} className={'button button--medium button--clear form-group__element--left button--no-icon next-action'} aria-label={formalName}>{formalName}</Link>;
  } else if (disabled) {
    return formalName;
  } else {
    if (typeof formId === 'undefined' || stepType === 'service') {
        if (row.step_data && row.step_data.action_id) {
        return <Link to={''} className={'button button--medium button--clear form-group__element--left button--no-icon next-action'} aria-label={formalName}>{formalName}</Link>;
      }
      return <Link to={`/requests/approval?requestId=${row.id}&step=${step}`} className={'button button--medium button--green form-group__element--left button--no-icon next-action'} aria-label={formalName || 'review item'}>{formalName}</Link>;
    } else {
      return <Link to={`/forms/id/${formId}?requestId=${row.id}`} className={'button button--medium button--green form-group__element--left button--no-icon next-action'} aria-label={formalName || 'view form details'}>{formalName}</Link>;
    }
  }
};

export const getFormalName = (str) => {
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
};

export const stepLookup = (row) => {
  const stepName = row?.step_data?.name;
  let request = '';
  let stepID = '';
  let stepType = '';
  let stepIDKey = '';
  let tmpType = '';
  const formalName = getFormalName(stepName);
  for (const i in row?.step_data) {
    if (typeof row.step_data[i] !== 'undefined') {
      const regex = new RegExp(stepName, 'g');
      if (i.match('name') && row.step_data[i].match(regex)) {
        stepType = row.step_data.type;
        stepIDKey = `${stepType}_id`;
        stepID = row.step_data[stepIDKey];
        if (row.step_data.type.match(/close/g)) {
          return 'Completed';
        }
        if (typeof stepID === 'undefined') {
          if (typeof row.step_data.form_id !== 'undefined') {
            stepID = row.step_data.form_id;
          } else if (typeof row.step_data.data !== 'undefined') {
            tmpType = row.step_data.data.type;
            const tmpIDKey = `${tmpType}_id`;
            stepID = row.step_data.data[tmpIDKey];
            // Build url to forms app - after submitted
            if (tmpType.match(/form/g)) {
              request = `${_config.formsUrl}/questions/${row.id}`;
            }
          }
        }
        // Build url to forms app if not submitted
        if (stepType.match(/form/g)) {
          request = `${_config.formsUrl}/questions/${row.id}`;
        // Link to mEditor as blank page
        } else if (stepName.match(/edit_metadata_in_meditor/g)) {
          request = `${window.location.origin}${_config.sendUserToMeditor}/Collection%20Metadata/${row.metadata.ShortName}_${row.metadata.Version}?autologin`;
        // assign a workflow
        } else if (stepType.match(/action/g)) {
          request = `/workflows?requestId=${row.id}`;
        }
        break;
      }
    }
  }
  if (stepType.match(/action/g) && stepName.match(/edit_metadata_in_meditor/g)) {
    return sendToMeditor(row, stepName, request, formalName);
  } else if (stepType.match(/action/g) && stepName.match(/assign_a_workflow/g)) {
    return assignWorkflow(request, formalName);
  } else if (stepType.match(/action/g)) {
    return existingLink(row, undefined, formalName, stepName);
  } else if (stepType.match(/review/g) || stepType.match(/service/g)) {
    return existingLink(row, stepID, formalName, stepName, stepType);
  } else {
    return newLink(request, formalName);
  }
};
export const tableColumns = [
  {
    Header: 'Data Product Name',
    accessor: row => row.form_data ? row.form_data.data_product_name_value || `Request Initialized by ${row.initiator.name}` : `Request Initialized by ${row.initiator.name}`,
    Cell: row => row.row ? <Link to={{ pathname: `/requests/id/${row.row.original.id}` }} aria-label="View your request details" id={row.row.original.id}>{row.row.original.form_data ? row.row.original.form_data.data_product_name_value || `Request Initialized by ${row.row.original.initiator.name}` : `Request Initialized by ${row.row.original.initiator.name}`}</Link> : `Request Initialized by ${row.row.original.initiator.name}`,
    id: 'name',
    // width: 155
  },
  {
    Header: 'Data Producer Name',
    accessor: row => row.form_data ? row.form_data.data_producer_info_name : null,
    Cell: row => row.row ? <Link to={{ pathname: `/requests/id/${row.row.original.id}` }} aria-label="View your request details" id={row.row.original.id}>{row.row.original.form_data ? row.row.original.form_data.data_producer_info_name : null}</Link> : null,
    id: 'data_producer_info_name',
    // width: 155
  },
  {
    Header: 'Status',
    accessor: (row) => row.status,
    Cell: row => row.row ? <Link to={{ pathname: `/requests/id/${row.row.original.id}` }} aria-label="View your request details">{row.row.original.status}</Link> : null,
    id: 'status_message',
    // width: 170
  },
  {
    Header: 'Workflow',
    accessor: (row) => row.workflow_name,
    Cell: row => row.row.original.workflow_name ? <Link to={{ pathname: `/workflows/id/${row.row.original.workflow_id}` }} aria-label="View your workflow details">{row.row.original.workflow_name}</Link> : null,
    id: 'workflow_name',
    // width: 170
  },
  {
    Header: 'Created',
    accessor: row => shortDateNoTimeYearFirst(row.created_at),
    id: 'created_at',
    // width: 110
  },
  {
    Header: 'Latest Edit',
    accessor: row => shortDateNoTimeYearFirst(row.last_change),
    id: 'last_change',
    // width: 110
  },
  {
    Header: 'Conversation',
    accessor: (row) => row.conversation_id ? <Link to={{ pathname: `/conversations/id/${row.conversation_id}` }} aria-label="View your conversation details">View</Link> : null,
    id: 'conversation_id',
    // width: 120
  },
  {
    Header: 'Next Action',
    accessor: row => stepLookup(row),
    id: 'next_action',
    // width: 170
  }
];

export const errorTableColumns = [
  {
    Header: 'Error',
    accessor: row => <ErrorReport report={get(row, 'error.Cause', nullValue)} truncate={true} />,
    id: 'error',
    disableSortBy: true,
    width: 175
  },
  {
    Header: 'Type',
    accessor: row => get(row, 'error.Error', nullValue),
    id: 'type',
    disableSortBy: true,
    width: 100
  },
  {
    Header: 'Requests',
    accessor: (row) => row.id,
    Cell: row => row.row ? requestLink(row.row.original.id) : null,
    id: 'id',
    width: 200
  },
  {
    Header: 'Updated',
    accessor: row => fromNow(row.last_change),
    id: 'last_change'
  }
];

export const simpleDropdownOption = function (config) {
  return (
    <Dropdown
      key={config.label}
      label={config.label}
      value={config.value}
      options={config.options}
      id={config.label}
      onChange={config.handler}
      noNull={true}
    />
  );
};

const confirmRecover = (d) => `Recover ${d} request(s)?`;
export const recoverAction = (requests, config) => ({
  text: 'Recover Request',
  action: config.recover.action,
  state: requests.executed,
  confirm: confirmRecover
});

const confirmDelete = (d) => `Delete ${d} request(s)?`;

/**
 * Determines next location based on request success/error and number of
 * successes.
 *   - If there's an error do nothing.
 *   - If there is a single request visit that request's detail page
 *   - If there are multiple requests reingested visit the running requests page.
 * Multiple requests will redirect to a base location determined by the current
 * location's pathname.
 *
 * @param {Object} anonymous
 * @param {Object} anonymous.history - Connected router history object.
 * @param {Object} anonymous.error - error object.
 * @param {Object} anonymous.selected - array of selected values.
 * @param {Function} anonymous.closeModal - function to close the Modal component.
 * @returns {Function} function to call on confirm selection.
 */

export const bulkActions = function (requests, config) {
  return [
    {
      text: 'Delete',
      action: deleteRequest,
      state: requests.deleted,
      confirm: confirmDelete,
      className: 'button--delete'
    }];
};
