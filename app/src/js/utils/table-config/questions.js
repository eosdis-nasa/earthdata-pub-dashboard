'use strict';
import React from 'react';
import { questionLink } from '../format';
import Dropdown from '../../components/DropDown/simple-dropdown';
import { Link } from 'react-router-dom';

export const tableColumns = [
  {
    Header: 'Title',
    accessor: (row) => row.long_name,
    Cell: row => questionLink(row.row.original.id, row.row.original.long_name),
    id: 'question_name',
    width: 175
  },
  {
    Header: 'Version',
    accessor: row => row.version,
    id: 'version',
    width: 70
  },
  {
    Header: 'Text',
    accessor: row => row.text,
    id: 'text',
    width: 200
  },
  {
    Header: 'Help',
    accessor: row => row.help,
    id: 'help',
    width: 200
  },
  {
    Header: 'Created At',
    accessor: row => row.created_at,
    id: 'created_at'
  },
  {
    Header: 'Options',
    accessor: '',
    Cell: row => <Link className='button button--small button--edit' to={{ pathname: `/questions/edit/${row.row.original.id}` }} aria-label="Edit your question">Edit</Link>,
    id: 'required'
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
