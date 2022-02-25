'use strict';
import React from 'react';
import { get } from 'object-path';
import { Link } from 'react-router-dom';
import {
  shortDateNoTimeYearFirst,
  nullValue,
  fromNow,
  submissionLink,
  bool
} from '../format';
import {
  deleteRequest
} from '../../actions';
import ErrorReport from '../../components/Errors/report';
import Dropdown from '../../components/DropDown/simple-dropdown';
import _config from '../../config';

export const newLink = (request, formalName) => {
  return <a href={request} className='button button--small button--green form-group__element--left button--no-icon'>{formalName}</a>;
};

export const assignWorkflow = (request, formalName, disabled = false) => {
  const disabledClass = disabled ? 'button--disabled' : '';
  return <a href={request} name="assignButton" className={`button button--small button--green form-group__element--left button--no-icon ${disabledClass}`}>{formalName}</a>;
};

export const existingLink = (row, formId, formalName, step) => {
  if (typeof formId === 'undefined') {
    return <Link to={`/requests/approval?requestId=${row.id}&step=${step}`} className='button button--small button--green form-group__element--left button--no-icon'>{formalName}</Link>;
  } else {
    return <Link to={`/forms/id/${formId}?requestId=${row.id}`} className='button button--small button--green form-group__element--left button--no-icon'>{formalName}</Link>;
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

export const getPrivileges = () => {
  let disabled = false;
  const user = JSON.parse(window.localStorage.getItem('auth-user'));
  const roles = user.user_roles;
  const privileges = user.user_privileges;
  const isManager = roles.find(o => o.short_name.match(/manager/g));
  const isAdmin = privileges[0].match(/ADMIN/g);
  if (typeof isManager !== 'undefined' || typeof isAdmin !== 'undefined') {
    disabled = false;
  } else {
    disabled = true;
  }
  return disabled;
};

export const stepLookup = (row) => {
  const stepName = row.step_name;
  let request = '';
  let stepID = '';
  let stepType = '';
  let stepIDKey = '';
  let tmpType = '';
  const formalName = getFormalName(stepName);
  for (const i in row.step_data) {
    if (typeof row.step_data[i] !== 'undefined') {
      const regex = new RegExp(stepName, 'g');
      if (i.match('name') && row.step_data[i].match(regex)) {
        stepType = row.step_data.type;
        stepIDKey = `${stepType}_id`;
        stepID = row.step_data[stepIDKey];
        if (row.step_data.type.match(/close/g)) {
          // This needs to do something but the API has no function related to status'
        }
        if (typeof stepID === 'undefined' && typeof row.step_data.data !== 'undefined') {
          tmpType = row.step_data.data.type;
          const tmpIDKey = `${tmpType}_id`;
          stepID = row.step_data.data[tmpIDKey];
          // Build url to forms app - after submitted
          if (tmpType.match(/form/g)) {
            request = `${_config.formsUrl}?formId=${stepID}&requestId=${row.id}&group=${row.daac_id}`;
          }
        }
        // Build url to forms app if not submitted
        if (stepType.match(/form/g)) {
          request = `${_config.formsUrl}?formId=${stepID}&requestId=${row.id}&group=${row.daac_id}`;
        // assign a workflow
        } else if (stepType.match(/action/g)) {
          request = `/workflows?requestId=${row.id}`;
        }
        break;
      }
    }
  }
  // step_data and step_name are available, but also need form_id, service_id and action_id in order to make a generalized function
  // Until that is added to the endpoint, I need to hardcode
  if (stepName.match(/data_accession_request_form/g) == null && stepName.match(/data_production_information_form/g) == null) {
    return existingLink(row, undefined, formalName, stepName);
  } else if (stepType.match(/review/g)) {
    if (typeof StepID === 'undefined') {
      if (stepName.match(/data_accession_request_form_review/g)) {
        stepID = '6c544723-241c-4896-a38c-adbc0a364293';
      } else if (stepName.match(/data_production_information_form_review/g)) {
        stepID = '19025579-99ca-4344-8610-704dae626343';
      }
    }
    return existingLink(row, stepID, formalName, stepName);
  } else if (stepType.match(/action/g)) {
    return assignWorkflow(request, formalName, getPrivileges());
  } else {
    return newLink(request, formalName);
  }
};

export const tableColumns = [
  {
    Header: 'Data Product Name',
    accessor: row => row.form_data ? row.form_data.data_product_name_value || '(no name)' : '(no name)',
    Cell: row => row.row ? <Link to={{ pathname: `/requests/id/${row.row.original.id}` }}>{row.row.original.form_data ? row.row.original.form_data.data_product_name_value || '(no name)' : '(no name)'}</Link> : '(no name)',
    id: 'name',
    width: 170
  },
  {
    Header: 'Status',
    accessor: (row) => row.status,
    Cell: row => row.row ? <Link to={{ pathname: `/requests/id/${row.row.original.id}` }}>{row.row.original.status}</Link> : null,
    id: 'status_message',
    width: 170
  },
  {
    Header: 'Workflow',
    accessor: (row) => row.workflow_name,
    Cell: row => row.row.original.workflow_name,
    id: 'workflow_name',
    width: 170
  },
  {
    Header: 'Created',
    accessor: row => shortDateNoTimeYearFirst(row.created_at),
    id: 'created_at',
    width: 110
  },
  {
    Header: 'Latest Edit',
    accessor: row => shortDateNoTimeYearFirst(row.last_change),
    id: 'last_change',
    width: 110
  },
  {
    Header: 'Locked',
    accessor: row => bool(row.lock),
    id: 'lock',
    width: 100
  },
  {
    Header: 'Conversation',
    accessor: (row) => row.conversation_id ? <Link to={{ pathname: `/conversations/id/${row.conversation_id}` }}>View</Link> : null,
    id: 'conversation_id',
    width: 120
  },
  {
    Header: 'Next Action',
    accessor: row => stepLookup(row),
    id: 'next_action',
    width: 170
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
    Cell: row => row.row ? submissionLink(row.row.original.id) : null,
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
