'use strict';
import React from 'react';
import { Link } from 'react-router-dom';
import { shortDateNoTimeYearFirst } from '../format';

export const tableColumns = [
  {
    Header: 'Short Name',
    accessor: row => <Link to={`forms/id/${row.id}`}>{row.short_name}</Link>,
    id: 'short_name'
  },
  {
    Header: 'Name',
    accessor: row => row.long_name,
    id: 'long_name'
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
    width: '100px'
  },
  {
    Header: 'Created',
    accessor: row => shortDateNoTimeYearFirst(row.created_at),
    id: 'created_at'
  }
];
