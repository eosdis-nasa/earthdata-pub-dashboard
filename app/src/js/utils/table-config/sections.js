'use strict';
import React from 'react';
import { Link } from 'react-router-dom';
import { shortDateNoTimeYearFirst } from '../format';

export const tableColumns = [
  {
    Header: 'Id',
    accessor: row => row.id,
    Cell: row => (
      <Link
        to={{ pathname: `/sections/edit/${row.row.original.id}` }}
        aria-label="View your form details"
      >
        {row.row.original.id}
      </Link>
    ),
    id: 'id'
  },
  {
    Header: 'Form Id',
    accessor: row => row.form_id,
    id: 'form_id'
  },
  {
    Header: 'Heading',
    accessor: row => row.heading,
    id: 'heading'
  },
  {
    Header: 'List Order',
    accessor: row => row.list_order,
    id: 'list_order'
  },
  {
    Header: 'Required If',
    accessor: row => row.required_if, 
    Cell: row => {
      const value = row.row.original.required_if;
      return value && value.length > 0
        ? (       
            JSON.stringify(value, null, 2)          
          )
        : ''; 
    },
    id: 'required_if'
  },
  {
    Header: 'Show If',
    accessor: row => row.show_if, 
    Cell: row => {
      const value = row.row.original.show_if;
      return value && value.length > 0
        ? (
            JSON.stringify(value, null, 2)
          )
        : ''; 
    },
    id: 'show_if'
  },
  {
    Header: 'DAAC ID',
    accessor: row => row.daac_id,
    id: 'daac_id'
  },
];
