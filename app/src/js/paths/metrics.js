'use strict';
import { strings } from '../components/locale';
const routes = [
  ['', null]
];

const requestRoutes = [
  ['', '', null, '', false],
  [strings.all_metrics, '/metrics/', null, 'sidebar__nav--back'],
  ['DAAC Metrics', '/metrics/daacs', null, 'sidebar__nav--back', true],
  ['User Metrics', '/metrics/users', null, 'sidebar__nav--back', true],
  ['My Metrics', '/metrics/mymetrics', null, 'sidebar__nav--back'],
];

const singleRoutes = [
  [strings.back_to_metrics, null, 'sidebar__nav--back']
];

const empty = [['', '']];

const handler = {
  base: 'metrics',
  heading: 'Metrics',
  routes: (currentRoute, params) => {
    if (currentRoute.indexOf('metrics/id') >= 0) {
      return singleRoutes;
    } else if (currentRoute.slice(0, 8) === '/metrics') {
      return requestRoutes.map(d => {
        if (typeof d[0] !== 'undefined' && !d[0].match(strings.back_to_requests) &&
            (!d[1] || d[1].indexOf(':requestId') === -1)) {
          return d;
        }
        return empty;
      });
    } else {
      return routes;
    }
  }
};

export default handler;
