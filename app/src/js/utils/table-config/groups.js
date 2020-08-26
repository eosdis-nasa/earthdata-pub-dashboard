'use strict';
import React from 'react';
import { Link } from 'react-router-dom';
import { fromNow } from '../format';

export const tableColumns = [
  {
    Header: 'Group Name',
    accessor: row => <Link to={`groups/group/${row.groupId}`}>{row.groupId}</Link>,
    id: 'name'
  },
  {
    Header: 'Permissions',
    accessor: row => row.permissions,
    id: 'permissions'
  },
  {
    Header: 'Subscriptions',
    accessor: row => row.subscriptions,
    id: 'subscriptions'
  },
  {
    Header: 'Last Updated',
    accessor: row => fromNow(row.timestamp),
    id: 'timestamp'
  }
];
