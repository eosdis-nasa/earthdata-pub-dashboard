'use strict';
import React from 'react';
import { Link } from 'react-router-dom';
export const getTableColumns = (requestsList) => { 
  return [
  {
    Header: 'Subject',
    accessor: (row) => {
      const matchedRequest = requestsList?.find(
        (req) => req.id === row.subject.split('Request ID ')[1]
      );
      return (
        <div className='flex__column'>
          {matchedRequest && (
            <div>
               <Link to={`/conversations/id/${row.id}`} aria-label="View your conversation details">
                {
                  matchedRequest?.name ??
                  (matchedRequest?.initiator?.name
                    ? `Request Initialized by ${matchedRequest.initiator.name}`
                    : row.subject)
                }
              </Link>
            </div>
          )}

          <span className='text__green'>
            {row.unread ? '*new messages*' : ' '}
          </span>
        </div>
      );
    },
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
};
