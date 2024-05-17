'use strict';
import React from 'react';
import { Link } from 'react-router-dom';
import { shortDateNoTimeYearFirst } from '../format';

export const tableColumns = [
  {
    Header: 'Name',
    accessor: (row) => row.name,
    Cell: row => <Link to={{ pathname: `/users/id/${row.row.original.id}` }} aria-label="View your user details">{row.row.original.name}</Link>,
    id: 'name'
  },
  {
    Header: 'Email',
    accessor: row => row.email,
    id: 'email'
  },
  {
    Header: 'Registered',
    accessor: row => shortDateNoTimeYearFirst(row.registered),
    id: 'registered'
  },
  {
    Header: 'Last Login',
    accessor: row => shortDateNoTimeYearFirst(row.last_login),
    id: 'last_login'
  }
];
