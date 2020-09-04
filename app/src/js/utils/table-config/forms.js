'use strict';
import React from 'react';
import { Link } from 'react-router-dom';
import { fromNow } from '../format';

export const tableColumns = [
  {
    Header: 'Name',
    accessor: row => <Link to={`forms/form/${row.id}`}>{row.name}</Link>,
    id: 'name'
  },
  {
    Header: 'Version',
    accessor: row => row.version,
    id: 'version'
  },
  {
    Header: 'User Name',
    accessor: row => <Link to={`users/user/${row.userId}`}>{row.userName}</Link>,
    id: 'userName'
  },
  {
    Header: 'Created',
    accessor: row => fromNow(row.createdAt),
    id: 'createdAt'
  },
  {
    Header: 'Last Updated',
    accessor: row => fromNow(row.timestamp),
    id: 'timestamp'
  }
];
