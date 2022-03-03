'use strict';
import { encode } from '../utils/browser';
import tally from './tally';
import { strings } from '../components/locale';

const submissionRoutes = [
  ['', '', null, ''],
  [strings.submissions_inprogress2, '/requests', null, 'sidebar__nav--back'],
  [strings.submissions_actions, '/requests/status/action', null, 'sidebar__nav--back'],
  [strings.submissions_forms, '/requests/status/form', null, 'sidebar__nav--back'],
  [strings.submissions_review, '/requests/status/review', null, 'sidebar__nav--back'],
  [strings.submissions_service, '/requests/status/service', null, 'sidebar__nav--back'],
  [strings.submissions_closed, '/requests/status/closed', null, 'sidebar__nav--back'],
  [strings.submissions_withdrawn2, '/requests/withdrawn', null, 'sidebar__nav--back'],
];

const singleSubmissionRoutes = [
  [strings.back_to_submissions, null, 'sidebar__nav--back'],
  ['Edit Metadata', 'id/:requestId/edit-metadata', null, 'sidebar__nav--back']
];

const empty = [['', '']];

const requests = {
  base: 'requests',
  heading: strings.requests,
  routes: (currentRoute, params, count) => {
    if (currentRoute.indexOf('requests/id') >= 0) {
      const requestId = currentRoute.split('/')[3] || '';
      return singleSubmissionRoutes.map(d => {
        if (!d[1] || d[1].indexOf(':requestId') === -1) return d;
        const copy = d.slice();
        copy[1] = encode(copy[1].replace(':requestId', requestId));
        return copy;
      });
    } else if (currentRoute.slice(0, 9) === '/requests') {
      return submissionRoutes.map(d => {
        if (typeof d[0] !== 'undefined' && !d[0].match(strings.back_to_submissions) &&
          (!d[1] || d[1].indexOf(':requestId') === -1)) {
          return d;
        }
        return empty;
      });
    } else {
      return empty;
    }
  }
};

export default requests;
