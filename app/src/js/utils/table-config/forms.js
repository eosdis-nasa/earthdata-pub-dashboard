'use strict';
import React from 'react';
import { Link } from 'react-router-dom';
import { shortDateNoTimeYearFirst } from '../format';

export const tableColumns = [
  {
    Header: 'Short Name',
    accessor: (row) => row.short_name,
    Cell: row => <Link to={{ pathname: `/forms/edit/${row.row.original.id}` }} aria-label="View your form details">{row.row.original.short_name}</Link>,
    id: 'short_name'
  },
  {
    Header: 'Name',
    accessor: row => row.long_name,
    id: 'long_name',
  },
  {
    Header: 'Description',
    accessor: row => row.description,
    id: 'description'
  },
  {
    Header: 'Version',
    accessor: row => row.version,
    id: 'version',
  },
  {
    Header: 'Created',
    accessor: row => shortDateNoTimeYearFirst(row.created_at),
    id: 'created_at',
  },
  {
    Header: 'Daac only',
    accessor: row => row.daac_only,
    id: 'daac_only',
    Cell: ({ value }) => (value ? 'Yes' : 'No'),
  }
];
