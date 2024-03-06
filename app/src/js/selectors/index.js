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

export const metricOptionNames = () => {
  const options = [
    { value: 'submissions', label: 'Requests' },
    { value: 'time_to_publish', label: 'Time To Publish' },
    { value: 'user_count', label: 'User Count' }
  ];
  return options;
};

export const stateOptionNames = () => {
  const options = [
    { value: 'published', label: 'Published' },
    { value: 'withdrawn', label: 'Withdrawn' },
    { value: 'in_progress', label: 'In Progress' },
  ];
  return options;
};

export const daacOptionNames = () => {
  const options = [
    { value: '40397fe8-4841-4e4c-b84a-6ece359ff5ff', label: 'ASDC' },
    { value: 'c606afba-725b-4ae4-9557-1fd33260ae12', label: 'ASF DAAC' },
    { value: 'd551380f-8813-40e4-9763-2a5bb6007cd0', label: 'CDDIS' },
    { value: '1ea1da68-cb95-431f-8dd8-a2cf16d7ef98', label: 'GES DISC' },
    { value: 'ef229725-1cad-485e-a72b-a276d2ca3175', label: 'GHRC DAAC' },
    { value: '9e0628f1-0dde-4ed2-b1e3-690c70326f25', label: 'LAADS DAAC' },
    { value: 'de6d5ec9-4728-4f2b-9d43-ae2f0fdac96a', label: 'LP DAAC' },
    { value: 'aec3724f-b30b-4b3f-9b9a-e0907d9d14b3', label: 'NSIDC DAAC' },
    { value: 'fe75c306-ac04-4689-a702-073d9cb071fe', label: 'OB.DAAC' },
    { value: '15df4fda-ed0d-417f-9124-558fb5e5b561', label: 'ORNL DAAC' },
    { value: '6b3ea184-57c5-4fc5-a91b-e49708f91b67', label: 'PO.DAAC' },
    { value: '00dcf32a-a4e2-4e55-a0d1-3a74cf100ca1', label: 'SEDAC' },
    { value: '1c36f0b9-b7fd-481b-9cab-3bc3cea35413', label: 'Unknown' }
  ];
  return options;
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

export const conversationOptions = ({ conversations }) => {
  const options = { '': '' };
  get(conversations, 'list.data', []).forEach(d => {
    options[d.name] = d.name;
  });
  return options;
};

export const conversationOptionNames = ({ conversations }) => {
  return get(conversations, 'list.data', []).map(conversation => conversation.name);
};
