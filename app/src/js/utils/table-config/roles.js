import React from 'react';
import { Link } from 'react-router-dom';

export const tableColumns = [
  {
    Header: 'Short Name',
    accessor: (row) => row.short_name,
    id: 'short_name'
  },
  {
    Header: 'Name',
    // accessor: (row) => <Link to={`/roles/role/${row.id}`}>{row.long_name}</Link>,
    accessor: (row) => row.long_name,
    id: 'long_name'
  },
  {
    Header: 'description',
    accessor: (row) => row.description,
    id: 'description'
  }
];
