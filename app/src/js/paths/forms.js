'use strict';
import tally from './tally';

const formRoutes = [
  ['Overview', null]
];

const singleFormRoutes = [
  ['Back to Forms', null, 'sidebar__nav--back']
];

const empty = [['', '']];

const forms = {
  base: 'forms',
  heading: 'Forms',
  routes: (currentRoute, params, count) => {
    if (currentRoute.indexOf('/forms/form') >= 0) {
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
