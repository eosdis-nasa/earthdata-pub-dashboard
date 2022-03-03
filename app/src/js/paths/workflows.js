'use strict';
import { strings } from '../components/locale';
const routes = [
  ['', null]
];

const singleRoutes = [
  [strings.back_to_submissions, '/requests', 'sidebar__nav--back'],
  [strings.back_to_workflows, '/workflows', 'sidebar__nav--back']
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
