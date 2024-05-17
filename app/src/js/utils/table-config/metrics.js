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

export const convertSecondsToDHMS = seconds => {
  seconds = Math.floor(seconds); // Convert to integer, ignoring decimal points
  const days = Math.floor(seconds / (3600 * 24));
  let remainingSeconds = seconds % (3600 * 24);
  const hours = Math.floor(remainingSeconds / 3600);
  remainingSeconds %= 3600; 
  const minutes = Math.floor(remainingSeconds / 60);
  remainingSeconds %= 60; 
  return {
      days,
      hours,
      minutes,
      seconds: remainingSeconds
  };
};

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
    id: 'id'
  },
  {
    Header: 'State',
    accessor: row => getState(row.step_name, row.hidden),
    id: 'state'
  },
  {
    Header: 'Workflow',
    accessor: (row) => row.workflow_name,
    Cell: row => row.row.original.workflow_id ? <Link to={{ pathname: `/workflows/id/${row.row.original.workflow_id}` }} aria-label="View your workflow details">{row.row.original.workflow_name}</Link> : null,
    id: 'workflow_name'
  },
  {
    Header: 'DAAC',
    accessor: (row) => row.daac_id,
    Cell: row => row.row.original.daac_id && getDaac(row.row.original.daac_id, row) ? getDaac(row.row.original.daac_id, row) : null,
    id: 'daac_id'
  },
  {
    Header: 'Latest Edit',
    accessor: row => shortDateNoTimeYearFirst(row.last_change),
    id: 'last_change'
  },
  {
    Header: 'Time to Publish',
    accessor: (row) => getTime(convertSecondsToDHMS(row.time_to_publish)),
    id: 'time_to_publish'
  }
];

export const timeColumns = [
  {
    Header: 'DAAC',
    accessor: (row) => row.daac_id,
    Cell: row => row.row.original.daac_id ? <Link to={{ pathname: `/daacs/id/${row.row.original.daac_id}` }} aria-label="View your daac details">{row.row.original.daac_id}</Link> : null,
    id: 'daac_id'
  },
  {
    Header: 'Time to Publish',
    accessor: (row) => getTime(convertSecondsToDHMS(row.time_to_publish)),
    id: 'time_to_publish'
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
    accessor: (row) => getTime(convertSecondsToDHMS(row.average_time_to_publish)),
    id: 'average_time_to_publish',
  }
];
