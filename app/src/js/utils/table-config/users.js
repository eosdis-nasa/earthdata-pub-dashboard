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

export const makeGroups = (row) => {
  try {
    let groups = []
    for(let ea in row.groups){
      groups.push(row.groups[ea].name)
    }
    return groups.join(', ')
  } catch(error){
    return '';
  }
};

export const tableColumns = [
  {
    Header: 'Name',
    accessor: row => userLink(row.userId),
    id: 'userName',
  },
  {
    Header: 'Email',
    accessor: row => row.email,
    id: 'email'
  },
  {
    Header: 'Groups',
    accessor: makeGroups,
    id: 'groups'
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
