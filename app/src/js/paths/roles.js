'use strict';
const routes = [
  ['', null]
];

const singleRoutes = [
  ['Back to Roles', null, 'sidebar__nav--back']
];

const empty = [['', '']];

const handler = {
  base: 'roles',
  heading: 'Roles',
  routes: (currentRoute, params) => {
    if (currentRoute.indexOf('roles/id') >= 0) {
      return singleRoutes;
    } else if (currentRoute.slice(0, 8) !== '/roles') {
      return empty;
    } else {
      return routes;
    }
  }
};

export default handler;
