'use strict';
import React from 'react';
import { Link } from 'react-router-dom';
export const tableColumns = [
  {
    Header: 'Subject',
    accessor: (row) => (
      <Link to={`/conversations/id/${row.id}`}>
        {row.subject}
        {row.unread && <span className='text__green'>*new messages*</span>}
      </Link>),
    id: 'conversation_subject'
  },
  {
    Header: 'Last Change',
    accessor: (row) => row.last_change,
    id: 'changed_date'
  },
  {
    Header: 'Created At',
    accessor: (row) => row.created_at,
    id: 'creation_date'
  }
];
