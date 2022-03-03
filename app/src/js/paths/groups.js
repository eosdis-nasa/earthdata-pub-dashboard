'use strict';
import tally from './tally';
import { strings } from '../components/locale';
const groupRoutes = [
  ['', null]
];

const singleGroupRoutes = [
  [strings.back_to_submissions, '/requests', 'sidebar__nav--back'],
  [strings.back_to_groups, null, 'sidebar__nav--back']
];

const empty = [['', '']];

const groups = {
  base: 'groups',
  heading: 'Groups',
  routes: (currentRoute, params, count) => {
    if (currentRoute.indexOf('groups/id') >= 0) {
      return singleGroupRoutes;
    } else if (currentRoute.slice(0, 10) !== '/groups') {
      return empty;
    } else {
      count = count || [];
      return groupRoutes.map(d => tally(d, count));
    }
  }
};

export default groups;
