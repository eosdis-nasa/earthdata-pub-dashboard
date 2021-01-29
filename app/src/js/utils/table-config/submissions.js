'use strict';
import React from 'react';
import { get } from 'object-path';
import { Link } from 'react-router-dom';
import {
  shortDateNoTimeYearFirst,
  nullValue,
  fromNow,
  displayCase,
  submissionLink,
  // dataSubmissionRequestLink,
  // dataProductQuestionaireLink,
  // dataProducerLink,
  // pointOfContactLink,
  // workflowLink
} from '../format';
import {
  deleteSubmission
} from '../../actions';
import ErrorReport from '../../components/Errors/report';
import Dropdown from '../../components/DropDown/simple-dropdown';

export const tableColumns = [
  {
    Header: 'Status',
    accessor: row => <Link to={`/submissions/${row.status_message}`} className={`submission__status_message submission__status_message--${row.status_message}`}>{displayCase(row.status_message)}</Link>,
    id: 'status_message',
    width: 100
  },
  {
    Header: 'Workflow',
    accessor: row => <Link to={`/workflows/id/${row.workflow_id}`} className={`submission__workflow submission__workflow--${row.workflow_id}`}>{displayCase(row.workflow_name)}</Link>,
    id: 'workflow_name',
    width: 100
  },
  {
    Header: 'Step',
    accessor: row => <Link to={`submissions/id/${row.id}`}>{row.stop_name}</Link>,
    id: 'step_name',
    width: 100
  },
  {
    Header: 'Name',
    accessor: row => <Link to={`submissions/id/${row.id}`}>{row.name}</Link>,
    id: 'name',
    width: 225
  },
  {
    Header: 'Created',
    accessor: row => shortDateNoTimeYearFirst(row.created_at),
    id: 'created_at'
  },
  {
    Header: 'Latest Edit',
    accessor: row => shortDateNoTimeYearFirst(row.last_change),
    id: 'last_change'
  },
  {
    Header: 'Lock',
    accessor: row => row.lock,
    id: 'lock'
  }
  /* {
    Header: 'Data Submission Request',
    accessor: row => dataSubmissionRequestLink(row.dataSubmissionRequest, 'Data Submission Request'),
    id: 'dataSubmissionRequest',
    width: 225
  },
  {
    Header: 'Data Product Questionionnaire',
    accessor: row => dataProductQuestionaireLink(row.dataProductQuestionaire, 'Product Questionaire (Draft)'),
    id: 'dataProductQuestionaire',
    width: 225
  },
  {
    Header: 'Submission Date',
    accessor: row => shortDateNoTimeYearFirst(row.submitted),
    id: 'submitted'
  },
  {
    Header: 'Primary Data Producer',
    accessor: row => dataProducerLink(row.dataSubmissionRequest, row.dataProducer),
    id: 'dataProducer'
  },
  {
    Header: 'Point of Contact',
    accessor: row => pointOfContactLink(row.dataProductQuestionaire, row.contact),
    id: 'contact',
    width: 100
  }, */
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
    Header: 'Submission',
    accessor: row => submissionLink(row.id),
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
      label={config.label.toUpperCase()}
      value={config.value}
      options={config.options}
      id={config.label}
      onChange={config.handler}
      noNull={true}
    />
  );
};

const confirmRecover = (d) => `Recover ${d} submission(s)?`;
export const recoverAction = (submissions, config) => ({
  text: 'Recover Submission',
  action: config.recover.action,
  state: submissions.executed,
  confirm: confirmRecover
});

const confirmDelete = (d) => `Delete ${d} submission(s)?`;

/**
 * Determines next location based on submission success/error and number of
 * successes.
 *   - If there's an error do nothing.
 *   - If there is a single submission visit that submission's detail page
 *   - If there are multiple submissions reingested visit the running submissions page.
 * Multiple submissions will redirect to a base location determined by the current
 * location's pathname.
 *
 * @param {Object} anonymous
 * @param {Object} anonymous.history - Connected router history object.
 * @param {Object} anonymous.error - error object.
 * @param {Object} anonymous.selected - array of selected values.
 * @param {Function} anonymous.closeModal - function to close the Modal component.
 * @returns {Function} function to call on confirm selection.
 */

export const bulkActions = function (submissions, config) {
  return [
    {
      text: 'Delete',
      action: deleteSubmission,
      state: submissions.deleted,
      confirm: confirmDelete,
      className: 'button--delete'
    }];
};
