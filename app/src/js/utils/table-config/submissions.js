'use strict';
import React from 'react';
import { get } from 'object-path';
import { Link } from 'react-router-dom';
import {
  fromNow,
  bool,
  nullValue,
  displayCase,
  submissionLink,
  dataSubmissionRequestLink,
  dataProductQuestionaireLink,
  dataProducerLink,
  workflowLink
} from '../format';
import {
  deleteSubmission
} from '../../actions';
import ErrorReport from '../../components/Errors/report';
import Dropdown from '../../components/DropDown/simple-dropdown';

export const tableColumns = [
  {
    Header: 'Status',
    accessor: row => <Link to={`/submissions/${row.status}`} className={`submission__status submission__status--${row.status}`}>{displayCase(row.status)}</Link>,
    id: 'status',
    width: 100
  },
  {
    Header: 'Stage',
    accessor: row => <Link to={`/submissions/${row.stage}`} className={`submission__stage submission__stage--${row.stage}`}>{displayCase(row.stage)}</Link>,
    id: 'stage',
    width: 100
  },
  {
    Header: 'Name',
    accessor: row => submissionLink(row.submissionId),
    id: 'name',
    width: 225
  },
  {
    Header: 'Data Submission Request',
    accessor: row => dataSubmissionRequestLink(row.formId),
    id: 'dataSubmissionRequest',
    width: 225
  },
  {
    Header: 'Data Product Questionionnaire',
    accessor: row => dataProductQuestionaireLink(row.formId),
    id: 'dataProductQuestionaire',
    width: 225
  },
  {
    Header: 'Submission Date',
    accessor: row => fromNow(row.submitted),
    id: 'submitted'
  },
  {
    Header: 'Primary Data Producer',
    accessor: row => dataProducerLink(row.dataProducer),
    id: 'dataProducer'
  },
  {
    Header: 'Point of Contact',
    accessor: row => row.contact,
    id: 'contact',
    width: 100
  },
  {
    Header: 'Workflow',
    accessor: row => workflowLink(row.workflow),
    id: 'workflow',
    width: 100
  },
  {
    Header: 'Latest Edit',
    accessor: row => fromNow(row.timestamp),
    id: 'timestamp'
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
    Header: 'Submission',
    accessor: row => submissionLink(row.submissionId),
    id: 'submissionId',
    width: 200
  },
  {
    Header: 'Updated',
    accessor: row => fromNow(row.timestamp),
    id: 'timestamp'
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
