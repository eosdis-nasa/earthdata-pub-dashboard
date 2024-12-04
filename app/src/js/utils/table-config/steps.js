'use strict';
import React from 'react';
import { stepLink } from '../format';
import Dropdown from '../../components/DropDown/simple-dropdown';
import { Link } from 'react-router-dom';

export const getPrivileges = () => {
  const user = JSON.parse(window.localStorage.getItem('auth-user'));
  if (user != null) {
    const privileges = user.user_privileges;
    const allPrivs = {
      admin: privileges.find(o => o.match(/ADMIN/g)),
      canUpdateWorkflow: privileges.find(o => o.match(/WORKFLOW_UPDATE/g))
    };
    return allPrivs;
  }
};

export const tableColumns = [
  {
    Header: 'Name',
    accessor: (row) => row.step_name,
    Cell: row => stepLink(row.row.original.step_id, row.row.original.step_name),
    id: 'step_name',
    width: 175
  },
  {
    Header: 'Type',
    accessor: row => row.type,
    id: 'type',
    width: 200
  }
];

const allPrivs = getPrivileges();
if (typeof allPrivs !== 'undefined' && (allPrivs.admin || allPrivs.canUpdateWorkflow)) {
  tableColumns.push(
    {
      Header: 'Options',
      accessor: '',
      Cell: row => <Link className='button button--small button--edit' to={{ pathname: `/steps/edit/${row.row.original.step_id}` }} aria-label="Edit your step">Edit</Link>,
      id: 'required'
    }
  );
}

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
