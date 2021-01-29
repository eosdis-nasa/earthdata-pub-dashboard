'use strict';
const routes = [
  ['', null]
];

const singleRoutes = [
  ['Back to Metrics', null, 'sidebar__nav--back']
];

const empty = [['', '']];

const handler = {
  base: 'metrics',
  heading: 'Metrics',
  routes: (currentRoute, params) => {
    if (currentRoute.indexOf('metrics/id') >= 0) {
      return singleRoutes;
    } else if (currentRoute.slice(0, 8) !== '/metrics') {
      return empty;
    } else {
      return routes;
    }
  }
};

export default handler;
