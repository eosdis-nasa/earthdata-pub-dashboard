'use strict';
const routes = [
  ['', null]
];

const singleRoutes = [
  ['Back to Workflows', null, 'sidebar__nav--back'],
  ['View Requests List', '/requests', 'sidebar__nav']
];

const empty = [['', '']];

const handler = {
  base: 'workflows',
  heading: 'Workflows',
  routes: (currentRoute, params) => {
    if (currentRoute.indexOf('workflows/id') >= 0) {
      return singleRoutes;
    } else if (currentRoute.slice(0, 11) !== '/workflows') {
      return empty;
    } else {
      return routes;
    }
  }
};

export default handler;
