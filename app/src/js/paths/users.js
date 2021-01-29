'use strict';
import tally from './tally';

const userRoutes = [
  ['', null]
];

const singleUserRoutes = [
  ['Back to Users', null, 'sidebar__nav--back']
];

const empty = [['', '']];

const users = {
  base: 'users',
  heading: 'Users',
  routes: (currentRoute, params, count) => {
    if (currentRoute.indexOf('/users/id') >= 0) {
      return singleUserRoutes;
    } else if (currentRoute.slice(0, 10) !== '/users') {
      return empty;
    } else {
      count = count || [];
      return userRoutes.map(d => tally(d, count));
    }
  }
};

export default users;
