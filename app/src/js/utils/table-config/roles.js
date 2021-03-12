'use strict';
import React from 'react';
import { Link } from 'react-router-dom';
export const tableColumns = [
  {
    Header: 'Short Name',
    accessor: (row) => <Link to={`/roles/id/${row.id}`}>{row.short_name}</Link>,
    id: 'short_name'
  },
  {
    Header: 'Name',
    accessor: (row) => row.long_name,
    id: 'long_name'
  },
  {
    Header: 'Description',
    accessor: (row) => row.description,
    id: 'description'
  }
  /* ,
  {
    Header: 'Permissions',
    accessor: row => row.permissions.join(', '),
    id: 'permissions'
  },
  {
    Header: 'Subscriptions',
    accessor: row => row.subscriptions.join(', '),
    id: 'subscriptions'
  }, */
];
