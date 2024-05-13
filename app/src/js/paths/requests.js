'use strict';
import { encode } from '../utils/browser';
import { strings } from '../components/locale';

const requestRoutes = [
  ['', '', null, ''],
  [strings.requests_inprogress2, '/requests', null, 'sidebar__nav--back'],
  [strings.requests_actions, '/requests/status/action', null, 'sidebar__nav--back'],
  [strings.requests_forms, '/requests/status/form', null, 'sidebar__nav--back'],
  [strings.requests_review, '/requests/status/review', null, 'sidebar__nav--back'],
  [strings.requests_service, '/requests/status/service', null, 'sidebar__nav--back'],
  [strings.requests_closed, '/requests/status/closed', null, 'sidebar__nav--back'],
  [strings.requests_withdrawn2, '/requests/withdrawn', null, 'sidebar__nav--back'],
];

const singleRequestRoutes = [
  [strings.back_to_requests, null, 'sidebar__nav--back']
];

const empty = [['', '']];

const requests = {
  base: 'requests',
  heading: strings.requests,
  routes: (currentRoute, params, count) => {
    if (currentRoute.indexOf('requests/id') >= 0) {
      const requestId = currentRoute.split('/')[3] || '';
      return singleRequestRoutes.map(d => {
        if (!d[1] || d[1].indexOf(':requestId') === -1) return d;
        const copy = d.slice();
        copy[1] = encode(copy[1].replace(':requestId', requestId));
        return copy;
      });
    } else if (currentRoute.slice(0, 9) === '/requests') {
      return requestRoutes.map(d => {
        if (typeof d[0] !== 'undefined' && !d[0].match(strings.back_to_requests) &&
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
