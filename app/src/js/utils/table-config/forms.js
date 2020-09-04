'use strict';
import React from 'react';
import { Link } from 'react-router-dom';
import { fromNow } from '../format';

export const tableColumns = [
  {
    Header: 'Name',
    accessor: row => <Link to={`forms/form/${row.id}`}>{row.id}</Link>,
    id: 'name'
  },
  {
    Header: 'User Name',
    accessor: row => <Link to={`users/user/${row.id}`}>{row.id}</Link>,
    id: 'userName'
  },
  {
    Header: 'Last Updated',
    accessor: row => fromNow(row.timestamp),
    id: 'timestamp'
  }
];
