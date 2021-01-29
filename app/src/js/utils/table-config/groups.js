'use strict';
import React from 'react';
import { Link } from 'react-router-dom';

export const tableColumns = [
  {
    Header: 'Short Name',
    accessor: row => row.short_name,
    id: 'short_name'
  },
  {
    Header: 'Name',
    accessor: row => <Link to={`groups/id/${row.id}`}>{row.long_name}</Link>,
    id: 'long_name'
  },
  {
    Header: 'Description',
    accessor: row => row.description,
    id: 'description'
  },
  /* {
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
