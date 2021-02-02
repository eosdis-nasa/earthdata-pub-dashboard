'use strict';
import React from 'react';
import { Link } from 'react-router-dom';
import { shortDateNoTimeYearFirst } from '../format';

export const tableColumns = [
  {
    Header: 'Name',
    accessor: row => <Link to={`forms/id/${row.id}`}>{row.long_name}</Link>,
    id: 'long_name'
  },
  {
    Header: 'Version',
    accessor: row => row.version,
    id: 'version'
  },
  {
    Header: 'Description',
    accessor: row => row.description,
    id: 'description'
  },
  {
    Header: 'Created',
    accessor: row => shortDateNoTimeYearFirst(row.created_at),
    id: 'created_at'
  }
];
