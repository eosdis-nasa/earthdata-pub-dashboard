'use strict';
import { strings } from '../components/locale';
import tally from './tally';

const userRoutes = [
  ['', null]
];

const singleUserRoutes = [
  [strings.back_to_submissions, '/requests', 'sidebar__nav--back'],
  [strings.back_to_users, null, 'sidebar__nav--back']
];

const empty = [['', '']];

const users = {
  base: 'users',
  heading: 'Users',
  routes: (currentRoute, params, count) => {
    if (currentRoute.indexOf('users/id') >= 0) {
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
