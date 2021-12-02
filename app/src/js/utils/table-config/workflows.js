import React from 'react';
import { Link } from 'react-router-dom';
// import { awsRegion } from '../../config';
import { shortDateNoTimeYearFirst } from '../format';
export const makeSteps = (row) => {
  try {
    return Object.keys(row.steps).join(', ');
  } catch (error) {
    return '';
  }
};

/* export const buildLink = (r) => {
  const descriptionExists = r.definition && r.definition.Comment;
  const description = (r.definition && r.definition.Comment) || 'AWS Stepfunction';
  const href = r.arn ? `https://console.aws.amazon.com/states/home?region=${awsRegion}#/statemachines/view/${r.arn}` : null;
  if (href) return <a target='_blank' href={href}>{description}</a>;
  if (descriptionExists) return description;
  return null;
}; */

export const tableColumns = [
  {
    Header: 'Name',
    accessor: (row) => row.long_name,
    Cell: row => <Link to={{ pathname: `/workflows/id/${row.row.original.id}` }}>{row.row.original.long_name}</Link>,
    id: 'long_name'
  },
  {
    Header: 'Version',
    accessor: (row) => row.version,
    id: 'version',
    width: 70
  },
  {
    Header: 'Description',
    accessor: (row) => row.description,
    id: 'description'
  },
  {
    Header: 'Steps',
    accessor: makeSteps,
    id: 'steps'
  },
  {
    Header: 'Created At',
    accessor: row => shortDateNoTimeYearFirst(row.created_at),
    id: 'created_at'
  }
];
