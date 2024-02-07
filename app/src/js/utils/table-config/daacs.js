'use strict';
import React from 'react';
import { Link } from 'react-router-dom';

export const tableColumns = [
  {
    Header: 'Short Name',
    accessor: (row) => row.short_name,
    Cell: row => <Link to={{ pathname: `/daacs/id/${row.row.original.id}` }} aria-label="View your daac details">{row.row.original.short_name}</Link>,
    id: 'short_name'
  },
  {
    Header: 'Name',
    accessor: row => <><a id={`${row.long_name} website url`} name={`${row.long_name} website url`} aria-label={`Visit ${row.long_name} on the web`} href={row.url}>{row.long_name}</a></>,
    id: 'long_name'
  },
  {
    Header: 'Default Workflow',
    accessor: (row) => row.workflow_id,
    Cell: row => row.row.original.workflow_id ? <Link to={{ pathname: `/workflows/id/${row.row.original.workflow_id}` }} aria-label="View your workflow details">{row.row.original.workflow_id}</Link> : null,
    id: 'workflow_id',
  },
  {
    Header: 'Group ID',
    accessor: (row) => row.edpgroup_id,
    Cell: row => row.row.original.edpgroup_id ? <Link to={{ pathname: `/groups/id/${row.row.original.edpgroup_id}` }} aria-label="View your group details">{row.row.original.edpgroup_id}</Link> : null,
    id: 'edpgroup_id',
  },
  {
    Header: 'Onboarded',
    accessor: (row) => row.hidden,
    Cell: row => row.row.original.hidden ? 'No' : 'Yes',
    id: 'hidden',
  }
  /* {
    Header: 'Permissions',
    accessor: row => row.permissions.join(', '),
    id: 'permissions'
  },
  {
    Header: 'Subscriptions',
    accessor: row => row.subscriptions.join(', '),
    id: 'subscriptions'
  }, */
];
