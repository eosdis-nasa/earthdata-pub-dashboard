'use strict';
import React from 'react';
import { inputLink } from '../format';
import Dropdown from '../../components/DropDown/simple-dropdown';
import { Link } from 'react-router-dom';

export const tableColumns = [
  {
    Header: 'Control Id',
    accessor: row => row.control_id,
    id: 'control_id',
    Cell: row => inputLink(row.row.original.question_id, row.row.original.control_id),
    width: 170
  },
  {
    Header: 'Question ID',
    accessor: (row) => row.question_id,
    id: 'question_id',
    width: 100
  },
  {
    Header: 'Label',
    accessor: row => row.label,
    id: 'label',
    width: 70
  },
  {
    Header: 'Enums',
    accessor: row => {
      if (Array.isArray(row.enums)) {
        return row.enums.map((enumItem, index) => (
          <span key={index}>
            {typeof enumItem === 'object' ? JSON.stringify(enumItem) : enumItem}
            {index < row.enums.length - 1 && ', '}
          </span>
        ));
      }
      return null; // If enums is not an array, display nothing
    },
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
