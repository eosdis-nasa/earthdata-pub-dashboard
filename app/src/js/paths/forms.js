'use strict';
import tally from './tally';

const formRoutes = [
  ['', null]
];

const singleFormRoutes = [
  ['Back to Requests', '/requests', 'sidebar__nav'],
  ['View List of Forms', null, 'sidebar__nav']
];

const empty = [['', '']];

const forms = {
  base: 'forms',
  heading: 'Forms',
  routes: (currentRoute, params, count) => {
    if (currentRoute.indexOf('forms/id') >= 0) {
      return singleFormRoutes;
    } else if (currentRoute.slice(0, 10) !== '/forms') {
      return empty;
    } else {
      count = count || [];
      return formRoutes.map(d => tally(d, count));
    }
  }
};

export default forms;
