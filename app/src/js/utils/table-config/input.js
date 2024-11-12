'use strict';
import React from 'react';
import { inputLink } from '../format';
import Dropdown from '../../components/DropDown/simple-dropdown';
import { Link } from 'react-router-dom';

export const tableColumns = [
  {
    Header: 'Question ID',
    accessor: (row) => row.question_id,
    Cell: row => inputLink(row.row.original.question_id, row.row.original.control_id),
    id: 'question_id',
    width: 100
  },
  {
    Header: 'Control Id',
    accessor: row => row.control_id,
    id: 'control_id',
    width: 170
  },
  {
    Header: 'Label',
    accessor: row => row.label,
    id: 'label',
    width: 70
  },
  
  {
    Header: 'Enums',
    accessor: row => (
      Array.isArray(row.enums)
        ? row.enums.map((enumObj, index) => (
            <span key={index}>
              {enumObj.label}
              {index < row.enums.length - 1 && ', '}
            </span>
          ))
        : null
    ),
    id: 'enums',
    width: 200
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
