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
  deleteSubmission
} from '../../actions';
import ErrorReport from '../../components/Errors/report';
import Dropdown from '../../components/DropDown/simple-dropdown';
import _config from '../../config';

let newDataPublicationRequest = `${_config.formsUrl}${_config.newPublicationRequestUrl}`;
let newDataProductInformation = `${_config.formsUrl}${_config.newProductInformationUrl}`;

export const dataPublicationLookup = (row) => {
  if (row.data_publication_request !== '') {
    return <Link to={`/forms/id/${row.data_publication_request}?requestId=${row.id}`}>Data Publication Request</Link>;
  } else {
    if (!newDataPublicationRequest.match(/formId/g) && !newDataPublicationRequest.match(/requestId/g)) {
      newDataPublicationRequest += `?formId=6c544723-241c-4896-a38c-adbc0a364293&requestId=${row.id}`;
    }
    return <a href={newDataPublicationRequest} className='button button--small button--green button--add form-group__element--left'>New</a>;
  }
};

export const dataProductInformationLookup = (row) => {
  if (row.data_product_information !== '') {
    return <Link to={`/forms/id/${row.data_product_information}?requestId=${row.id}`}>Data Product Information</Link>;
  } else {
    if (!newDataProductInformation.match(/formId/g) && !newDataProductInformation.match(/requestId/g)) {
      newDataProductInformation += `?formId=19025579-99ca-4344-8610-704dae626343&requestId=${row.id}`;
    }
    return <a href={newDataProductInformation} className='button button--small button--green button--add form-group__element--left'>New</a>;
  }
};

export const tableColumns = [
  {
    Header: 'Status',
    accessor: row => <Link to={`/requests/id/${row.id}`} className={`request__status_message request__status_message--${row.id}`}>{row.status_message}</Link>,
    id: 'status_message',
    width: 100
  },
  {
    Header: 'Workflow',
    accessor: row => <Link to={`/workflows/id/${row.workflow_id}`} className={`request__workflow request__workflow--${row.workflow_id}`}>{row.workflow_name}</Link>,
    id: 'workflow_name',
    width: 110
  },
  {
    Header: 'Step',
    accessor: row => row.step_name,
    id: 'step_name',
    width: 100
  },
  {
    Header: 'Name',
    accessor: row => row.name || '(no name)',
    id: 'name',
    width: 100
  },
  {
    Header: 'Data Publication Request',
    accessor: row => dataPublicationLookup(row),
    id: 'data_publication_request',
    width: 200
  },
  {
    Header: 'Data Product Information',
    accessor: row => dataProductInformationLookup(row),
    id: 'data_product_information',
    width: 200
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
    Header: 'Locked',
    accessor: row => bool(row.lock),
    id: 'lock'
  }
  /* {
    Header: 'Data Request Request',
    accessor: row => dataSubmissionRequestLink(row.dataSubmissionRequest, 'Data Request Request'),
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
    Header: 'Request Date',
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
    Header: 'Requests',
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
      action: deleteSubmission,
      state: requests.deleted,
      confirm: confirmDelete,
      className: 'button--delete'
    }];
};
