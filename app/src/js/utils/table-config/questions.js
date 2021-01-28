'use strict';
import React from 'react';
import { questionLink } from '../format';
import Dropdown from '../../components/DropDown/simple-dropdown';

export const tableColumns = [
  {
    Header: 'Title',
    accessor: row => questionLink(row.id, row.long_name),
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
