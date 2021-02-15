'use strict';
import { get } from 'object-path';

// functions all expect the full state as arguments

export const workflowOptions = ({ workflows }) => {
  const options = { '': '' };
  get(workflows, 'list.data', []).forEach(d => {
    options[d.name] = d.name;
  });
  return options;
};

export const workflowOptionNames = ({ workflows }) => {
  return get(workflows, 'list.data', []).map(workflow => workflow.name);
};

export const metricOptions = ({ metrics }) => {
  const options = { '': '' };
  get(metrics, 'list.data', []).forEach(d => {
    options[d.name] = d.name;
  });
  return options;
};

export const metricOptionNames = ({ metrics }) => {
  return get(metrics, 'list.data', []).map(metric => metric.name);
};

export const roleOptions = ({ roles }) => {
  const options = { '': '' };
  get(roles, 'list.data', []).forEach(d => {
    options[d.name] = d.name;
  });
  return options;
};

export const roleOptionNames = ({ roles }) => {
  return get(roles, 'list.data', []).map(role => role.name);
};
