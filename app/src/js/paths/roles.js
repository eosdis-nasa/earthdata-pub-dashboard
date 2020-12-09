'use strict';
import tally from './tally';

const roleRoutes = [
  ['Overview', null]
];

const singleRoleRoutes = [
  ['Back to Roles', null, 'sidebar__nav--back']
];

const empty = [['', '']];

const roles = {
  base: 'roles',
  heading: 'Roles',
  routes: (currentRoute, params, count) => {
    if (currentRoute.indexOf('/roles/role') >= 0) {
      return singleRoleRoutes;
    } else if (currentRoute.slice(0, 10) !== '/roles') {
      return empty;
    } else {
      count = count || [];
      return roleRoutes.map(d => tally(d, count));
    }
  }
};

export default roles;
