'use strict';
import React from 'react';
import { Link } from 'react-router-dom';
export const tableColumns = [
  {
    Header: 'Subject',
    accessor: (row) => <Link to={`/conversations/id/${row.id}`}>{row.subject}</Link>,
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
  },
  // {
  //   Header: 'ID',
  //   accessor: (row) => row.id,
  //   id: 'conversation_id'
  // }

];
