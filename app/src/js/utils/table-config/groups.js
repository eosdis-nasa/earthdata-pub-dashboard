'use strict';
import React from 'react';
import { Link } from 'react-router-dom';
import { shortDateNoTimeYearFirst } from '../format';

export const tableColumns = [
  {
    Header: 'Name',
    accessor: row => <Link to={`groups/group/${row.id}`}>{row.name}</Link>,
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
    accessor: row => shortDateNoTimeYearFirst(row.createdAt),
    id: 'createdAt'
  },
  {
    Header: 'Last Updated',
    accessor: row => shortDateNoTimeYearFirst(row.updatedAt),
    id: 'updatedAt'
  }
];
