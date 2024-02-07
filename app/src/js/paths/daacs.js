'use strict';
import tally from './tally';
import { strings } from '../components/locale';
const daacRoutes = [
  ['', null]
];

const singleDaacRoutes = [
  [strings.back_to_requests, '/requests', 'sidebar__nav--back'],
  [strings.back_to_daacs, null, 'sidebar__nav--back']
];

const empty = [['', '']];

const daacs = {
  base: 'daacs',
  heading: 'Daacs',
  routes: (currentRoute, params, count) => {
    if (currentRoute.indexOf('daacs/id') >= 0) {
      return singleDaacRoutes;
    } else if (currentRoute.slice(0, 10) !== '/daacs') {
      return empty;
    } else {
      count = count || [];
      return daacRoutes.map(d => tally(d, count));
    }
  }
};

export default daacs;
