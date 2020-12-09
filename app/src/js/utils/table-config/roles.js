'use strict';
import React from 'react';
import { Link } from 'react-router-dom';
import { fromNow } from '../format';

export const tableColumns = [
  {
    Header: 'Name',
    accessor: row => <Link to={`roles/role/${row.id}`}>{row.name}</Link>,
    id: 'name'
  },
  {
    Header: 'Permissions',
    accessor: row => row.permissions.join(', '),
    id: 'permissions'
  },
  {
    Header: 'Subscriptions',
    accessor: row => row.subscriptions.join(', '),
    id: 'subscriptions'
  },
  {
    Header: 'Created',
    accessor: row => fromNow(row.createdAt),
    id: 'createdAt'
  },
  {
    Header: 'Last Updated',
    accessor: row => fromNow(row.updatedAt),
    id: 'updatedAt'
  }
];
