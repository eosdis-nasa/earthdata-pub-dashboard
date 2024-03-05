import React from 'react';
import { Link } from 'react-router-dom';
import { shortDateNoTimeYearFirst } from '../../utils/format';
import { daacOptionNames } from '../../selectors';
export const tableColumns = [
  {
    Header: 'Event',
    accessor: (row) => row.id,
    Cell: row => <Link to={{ pathname: `/metrics/id/${row.row.original.id}` }} aria-label="View your event details">{row.row.original.id}</Link>,
    id: 'id'
  },
  {
    Header: 'Count',
    accessor: (row) => row.count,
    id: 'count'
  }
];

export const getTime = (obj) => {
  if (!obj) return '';
  if (typeof obj === 'undefined') return '';
  let time = '';
  if (obj.days) {
    time += `${obj.days} days `;
  }
  if (obj.hours) {
    time += `${obj.hours} hours `;
  }
  if (obj.minutes) {
    time += `${obj.minutes} minutes `;
  }
  if (obj.seconds) {
    time += `${obj.seconds} seconds `;
  }
  if (time === '') {
    if (obj.milliseconds) {
      time += `${obj.milliseconds} milliseconds`;
    }
  }
  return time;
};

export const getState = (state, hidden) => {
  if (typeof state === 'undefined') return '';
  let str = 'In Progress';
  if (hidden) {
    str = 'Withdrawn';
  } else if (state.match(/close/g)) {
    str = 'Published';
  }
  return str;
};

export const getDaac = (daacId, row) => {
  if (typeof daacId === 'undefined') return 'Unknown';
  const daacArray = daacOptionNames();
  for (const ea in daacArray) {
    if (daacArray[ea].value === daacId) {
      return daacArray[ea].label;
    }
  }
  return 'Unknown';
};

export const requestTableColumns = [
  {
    Header: 'Request ID',
    accessor: (row) => row.request_id,
    Cell: row => row.row ? <Link to={{ pathname: `/requests/id/${row.row.original.id}` }} aria-label="View your request details">{row.row.original.id}</Link> : null,
    id: 'id',
    // width: 170
  },
  {
    Header: 'State',
    accessor: row => getState(row.step_name, row.hidden),
    id: 'state',
    // width: 170
  },
  {
    Header: 'Workflow',
    accessor: (row) => row.workflow_name,
    Cell: row => row.row.original.workflow_id ? <Link to={{ pathname: `/workflows/id/${row.row.original.workflow_id}` }} aria-label="View your workflow details">{row.row.original.workflow_name}</Link> : null,
    id: 'workflow_name',
    // width: 170
  },
  {
    Header: 'DAAC',
    accessor: (row) => row.daac_id,
    /* accessor: row => get(row, 'error.Error', nullValue), */
    Cell: row => row.row.original.daac_id && getDaac(row.row.original.daac_id, row) ? getDaac(row.row.original.daac_id, row) : null,
    id: 'daac_id',
    // width: 170
  },
  {
    Header: 'Latest Edit',
    accessor: row => shortDateNoTimeYearFirst(row.last_change),
    id: 'last_change',
    // width: 110
  },
  {
    Header: 'Time to Publish',
    accessor: (row) => getTime(row.time_to_publish),
    id: 'time_to_publish',
    // width: 120
  }
];

export const timeColumns = [
  {
    Header: 'DAAC',
    accessor: (row) => row.daac_id,
    Cell: row => row.row.original.daac_id ? <Link to={{ pathname: `/daacs/id/${row.row.original.daac_id}` }} aria-label="View your daac details">{row.row.original.daac_id}</Link> : null,
    id: 'daac_id',
    // width: 170
  },
  {
    Header: 'Time to Publish',
    accessor: (row) => getTime(row.time_to_publish),
    id: 'time_to_publish',
    // width: 120
  }
];

export const countColumns = [
  {
    Header: 'User Count',
    accessor: (row) => row.count,
    Cell: row => row.row.original.user_count ? row.row.original.user_count : null,
    id: 'user_count',
    // width: 170
  }
];

export const daacTableColumns = [
  {
    Header: 'DAAC',
    accessor: 'daac_id',
    id: 'daac_id',
    Cell: row => row.row.original.daac_id && getDaac(row.row.original.daac_id, row) ? getDaac(row.row.original.daac_id, row) : null,
  },
  {
    Header: 'Requests Submitted',
    accessor: 'request_submitted',
    id: 'request_submitted', 
  },
  {
    Header: 'Requests Completed',
    accessor: 'request_completed',
    id: 'request_completed',
  },
  {
    Header: 'Avg Time to Publish',
    accessor: (row) => getTime(row.average_time_to_publish),
    id: 'average_time_to_publish',
  }
];
