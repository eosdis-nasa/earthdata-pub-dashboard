'use strict';
import React from 'react';
import { Link } from 'react-router-dom';
import { shortDateNoTimeYearFirst } from '../format';

export const tableColumns = [
  {
    Header: 'Name',
    accessor: row => <Link to={`users/user/${row.id}`}>{row.name}</Link>,
    id: 'name'
  },
  {
    Header: 'Email',
    accessor: row => row.email,
    id: 'email'
  },
  {
    Header: 'Roles',
    accessor: row => row.roles.join(', '),
    id: 'roles'
  },
  {
    Header: 'Groups',
    accessor: row => row.groups.join(', '),
    id: 'groups'
  },
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
  {
    Header: 'Last Login',
    accessor: row => shortDateNoTimeYearFirst(row.last_login),
    id: 'last_login'
  }
];
