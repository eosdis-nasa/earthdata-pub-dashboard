'use strict';
import React from 'react';
import { Link } from 'react-router-dom';
export const tableColumns = [
  {
    Header: 'Subject',
    accessor: (row) => (
      <div className='flex__column'>
        <div>
          <Link to={`/conversations/id/${row.id}`}>
            {row.subject}
          </Link>
        </div>
        <span className='text__green'>
          {row.unread ? '*new messages*' : ' '}
        </span>
      </div>
    ),
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
