'use strict';
import tally from './tally';
import { strings } from '../components/locale';

const formRoutes = [
  ['', null]
];

const singleFormRoutes = [
  [strings.back_to_requests, '/requests', 'sidebar__nav--back'],
  [strings.back_to_forms, '/forms', 'sidebar__nav--back'],
];

const empty = [['', '']];

const forms = {
  base: 'forms',
  heading: 'Forms',
  routes: (currentRoute, params, count) => {
    if (window.location.href.match(/requestId=/g) !== null && currentRoute.indexOf('forms/id') >= 0) {
      const requestId = window.location.href.split(/requestId=/)[1].split(/&/)[0];
      return [
        [strings.back_to_requests, '/requests', 'sidebar__nav--back'],
        [strings.back_to_request_detail, `/requests/id/${requestId}`, 'sidebar__nav--back'],
        [strings.back_to_forms, '/forms', 'sidebar__nav--back'],
      ]
    } else if (currentRoute.indexOf('forms/id') >= 0) {
      return singleFormRoutes;
    } else if (currentRoute.slice(0, 10) !== '/forms') {
      return empty;
    } else {
      count = count || [];
      return empty;
    }
  }
};

export default forms;
