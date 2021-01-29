'use strict';
import React from 'react';
import { Link } from 'react-router-dom';
import { shortDateNoTimeYearFirst } from '../format';

export const tableColumns = [
  {
    Header: 'Name',
    accessor: row => <Link to={`forms/id/${row.id}`}>{row.name}</Link>,
    id: 'name'
  },
  {
    Header: 'Version',
    accessor: row => row.version,
    id: 'version'
  },
  {
    Header: 'User Name',
    accessor: row => <Link to={`users/id/${row.userId}`}>{row.userName}</Link>,
    id: 'userName'
  },
  {
    Header: 'Created',
    accessor: row => shortDateNoTimeYearFirst(row.createdAt),
    id: 'createdAt'
  },
  {
    Header: 'Last Updated',
    accessor: row => shortDateNoTimeYearFirst(row.timestamp),
    id: 'timestamp'
  }
];
