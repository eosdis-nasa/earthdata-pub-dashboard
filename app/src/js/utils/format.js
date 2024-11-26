'use strict';
import React from 'react';
import moment from 'moment';
import numeral from 'numeral';
import { Link } from 'react-router-dom';
import { requestHideButtonVerbage } from '../config';

export const nullValue = '--';

export const truthy = (value) => value || nullValue;

export const fullDate = function (datestring) {
  if (!datestring) { return nullValue; }
  return moment(datestring).format('kk:mm:ss MM/DD/YY');
};

export const shortDateNoTime = function (datestring) {
  if (!datestring) { return nullValue; }
  return moment(datestring).format('MM/DD/YYYY');
};

export const shortDateNoTimeYearFirst = function (datestring) {
  if (!datestring) { return nullValue; }
  return moment(datestring).format('YYYY-MM-DD');
};

export const shortDateShortTimeYearFirst = function (datestring) {
  if (!datestring) { return nullValue; }
  let day, time;
  if (datestring) {
    const date = moment(datestring);
    day = date.format('MMM. D, YYYY');
    time = date.format('h:mm a');
  }
  return (
    <dl>
      <dd>{day} { time || null }</dd>
    </dl>
  );
};

export const shortDateShortTimeYearFirstJustValue = function (datestring) {
  if (!datestring) { return nullValue; }
  let day, time;
  if (datestring) {
    const date = moment(datestring);
    day = date.format('MMM D, YYYY');
    time = date.format('h:mm a');
  }
  return `${day} ${time}`;
};

export const calculateStorage = function(n) {
  const number = +n;
  if (!n || Number.isNaN(number)) return '--';

  if (number === 0) return n;

  if (number < 1e9) return `${(number / 1e6).toFixed(2)} MB`;
  if (number < 1e12) return `${(number / 1e9).toFixed(2)} GB`;
  if (number < 1e15) return `${(number / 1e12).toFixed(2)} TB`;
  return `${(number / 1e15).toFixed(2)} PB`;
};

export const parseJson = function (jsonString) {
  const parsed = JSON.parse(jsonString);
  return JSON.stringify(parsed, null, 2);
};

export const bigTally = function (numberstring) {
  if ((!numberstring && numberstring !== 0) || numberstring === nullValue || isNaN(numberstring)) { return nullValue; }
  numberstring = +numberstring;
  if (numberstring >= 1000) {
    return numeral(numberstring / 1000).format('0,0') + 'K';
  } else {
    return numeral(numberstring / 1000000).format('0,0') + 'M';
  }
};

export const tally = function (numberstring) {
  if ((!numberstring && numberstring !== 0) || numberstring === nullValue || isNaN(numberstring)) { return nullValue; }
  numberstring = +numberstring;
  if (numberstring < 1000) {
    return numberstring;
  } else if (numberstring < 100000) {
    return numeral(numberstring).format('0,0');
  } else {
    return bigTally(numberstring);
  }
};

export const seconds = function (numberstring) {
  if (numberstring === null || isNaN(numberstring)) { return nullValue; }
  return +numberstring.toFixed(2) + 's';
};

export const fromNow = function (numberstring) {
  if (numberstring === null || isNaN(numberstring)) { return nullValue; }
  return moment(numberstring).fromNow();
};

export const lastUpdated = function (datestring, text) {
  const meta = text || 'Last Updated';
  let day, time;
  if (datestring) {
    const date = moment.utc(datestring); // Parse the date as UTC
    const localDate = date.local(); // Convert to local time zone
    day = date.format('MMM. D, YYYY');
    time = date.format('h:mm a');
  }
  return (
    <dl className="metadata__updated">
      <dt>{meta}:</dt>
      <dd>{day}</dd>
      { time ? <dd className='metadata__updated__time'>{time}</dd> : null }
    </dl>
  );
};

export const requestLink = function (requestId) {
  if (!requestId) return nullValue;
  return <Link to={{ pathname: `/requests/id/${requestId}` }} aria-label="View your request details">{requestId}</Link>;
};
export const questionLink = function (questionId, questionName) {
  if (!questionId) return nullValue;
  return <Link to={{ pathname: `/questions/id/${questionId}` }} aria-label="View your question details">{questionName}</Link>;
};
export const inputLink = function (questionId, controlId) {
  if (!questionId) return nullValue;
  return <Link to={{ pathname: `/inputs/edit/${questionId}/${controlId}` }} aria-label="View your input details">{controlId}</Link>;
};
export const groupLink = function (groupId) {
  if (!groupId) return nullValue;
  return <Link to={`/groups/id/${groupId}`} aria-label="View your group details">{groupId}</Link>;
};
export const userLink = function (userId) {
  if (!userId) return nullValue;
  return <Link to={`/users/id/${userId}`} aria-label="View your user details">{userId}</Link>;
};
export const formLink = function (formId) {
  if (!formId) return nullValue;
  return <Link to={`/forms/id/${formId}`} aria-label="View your form details">{formId}</Link>;
};
export const workflowLink = function (name) {
  if (!name) return nullValue;
  return <Link to={`/workflows/id/${name}`} aria-label="View your workflow details">{name}</Link>;
};
export const metricLink = function (metricId) {
  if (metricId) return nullValue;
  return <Link to={`/metrics/id/${metricId}`} aria-label="View your metric details">{metricId}</Link>;
};
export const roleLink = function (roleId) {
  if (roleId) return nullValue;
  return <Link to={`/roles/id/${roleId}`} aria-label="View your role details">{roleId}</Link>;
};
export const conversationLink = function (conversationId) {
  if (conversationId) return nullValue;
  return <Link to={`/notes/id/${conversationId}`} aria-label="View your conversation details">{conversationId}</Link>;
};
export const messageLink = function (message) {
  if (!message) return nullValue;
  return <Link to={`/messages/id/${message}`} aria-label="View your message details">{message}</Link>;
};
export const bool = function (bool) {
  return bool ? 'Yes' : 'No';
};

export const displayCase = function (string) {
  const split = string.split(' ');
  return split.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

export const storage = (n) => {
  const number = +n;
  if (!n || Number.isNaN(number)) return nullValue;

  if (number === 0) return n;

  if (number < 1e9) return `${(number / 1e6).toFixed(2)} MB`;
  if (number < 1e12) return `${(number / 1e9).toFixed(2)} GB`;
  if (number < 1e15) return `${(number / 1e12).toFixed(2)} TB`;
  return `${(number / 1e15).toFixed(2)} PB`;
};

export const link = (url) => <a href={url} target='_blank' aria-label={url}>Link</a>;

export const truncate = function (string, to) {
  if (!string) return nullValue;
  to = to || 100;
  if (string.length <= to) return string;
  else return string.slice(0, to) + '... Show More';
};

export const enableText = function (name) {
  return `You are enabling rule ${name}`;
};

export const enableConfirm = function (name) {
  return `Rule ${name} was enabled`;
};

export const disableText = function (name) {
  return `You are disabling rule ${name}`;
};

export const disableConfirm = function (name) {
  return `Rule ${name} was disabled`;
};

export const deleteText = function (name) {
  return `Are you sure you want to permanently delete ${name}?`;
};

export const deleteTextWithType = function (name, type) {
  return `Are you sure you want to permanently ${requestHideButtonVerbage.toLowerCase()} ${type} ${name}?`;
};

export const confirmActionType = function (action, type) {
  return `Are you sure you want to ${action} ${type}?`;
};

export const rerunText = function (name) {
  return `Are you sure you want to rerun ${name}?`;
};

export const buildRedirectUrl = function ({ origin, pathname, hash }) {
  const hasQuery = hash.indexOf('?');

  if (hasQuery !== -1) {
    // TODO [MHS, 2020-04-04] Fix with the test changes.
    // const hashPrefix = hash.substr(0, hash.indexOf('/') + 1);
    const baseHash = hash.substr(hash.indexOf('/') + 1);
    const parsedUrl = new URL(baseHash, origin);
    // Remove any ?token query parameter to avoid polluting the login link
    parsedUrl.searchParams.delete('token');
    return encodeURIComponent(parsedUrl.href);
  }
  return encodeURIComponent(new URL(pathname + hash, origin).href);
};
