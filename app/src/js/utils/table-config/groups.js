'use strict';
import React from 'react';
import { Link } from 'react-router-dom';
import { fromNow } from '../format';

export const makePermissions = (row) => {
  try {
    let permissions = []
    for(let ea in row.permissions){
      permissions.push(row.permissions[ea].table_name)
    }
    return permissions.join(', ')
  } catch(error){
    return '';
  }
};

export const makeSubscriptions = (row) => {
  try {
    let subscriptions = []
    for(let ea in row.subscriptions){
      subscriptions.push(row.subscriptions[ea].table_name)
    }
    return subscriptions.join(', ')
  } catch(error){
    return '';
  }
};

export const tableColumns = [
  {
    Header: 'Group Name',
    accessor: row => <Link to={`groups/group/${row.groupId}`}>{row.name}</Link>,
    id: 'name'
  },
  {
    Header: 'Permissions',
    accessor: makePermissions,
    id: 'permissions'
  },
  {
    Header: 'Subscriptions',
    accessor: makeSubscriptions,
    id: 'subscriptions'
  },
  {
    Header: 'Last Updated',
    accessor: row => fromNow(row.timestamp),
    id: 'timestamp'
  }
];
