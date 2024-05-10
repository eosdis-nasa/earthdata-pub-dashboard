'use strict';
import React from 'react';
import { Link } from 'react-router-dom';

export const tableColumns = [
  {
    Header: 'Short Name',
    accessor: (row) => row.short_name,
    Cell: row => <Link to={{ pathname: `/groups/id/${row.row.original.id}` }} aria-label="View your group details">{row.row.original.short_name}</Link>,
    id: 'short_name'
  },
  {
    Header: 'Name',
    accessor: row => row.long_name,
    id: 'long_name'
  },
  {
    Header: 'Description',
    accessor: row => row.description,
    id: 'description'
  }
];
