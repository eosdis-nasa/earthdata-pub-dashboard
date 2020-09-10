import React from 'react';
import { Link } from 'react-router-dom';
import { awsRegion } from '../../config';

export const tableColumns = [
  {
    Header: 'Name',
    accessor: (row) => <Link to={`/metrics/metric/${row.name}`}>{row.name}</Link>,
    id: 'name'
  },
  {
    Header: 'Count',
    accessor: (row) => row.count,
    id: 'count'
  }
];
