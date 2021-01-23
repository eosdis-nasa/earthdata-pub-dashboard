import React from 'react';
import { Link } from 'react-router-dom';

export const tableColumns = [
  {
    Header: 'Name',
    accessor: (row) => row.event_type,
    id: 'event_type'
  },
  {
    Header: 'Count',
    accessor: (row) => row.count,
    id: 'count'
  }
];
