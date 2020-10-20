'use strict';
import React from 'react';
import { get } from 'object-path';
import { Link } from 'react-router-dom';
import {
  displayCase,
  questionLink
} from '../format';
import Dropdown from '../../components/DropDown/simple-dropdown';

export const tableColumns = [
  {
    Header: 'Title',
    accessor: row => <Link to={`/questions/question/${row.id}`}><h3>{row.title}</h3>{row.question_name}</Link>,
    id: 'question_name',
    width: 250
  },
  {
    Header: 'Version',
    accessor: row => row.version,
    id: 'version',
    width: 60
  },
  {
    Header: 'Text',
    accessor: row => row.text,
    id: 'text',
    width: 225
  },
  {
    Header: 'Help',
    accessor: row => row.help,
    id: 'help'
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
