'use strict';
import { strings } from '../components/locale';
const routes = [
  ['', null]
];

const requestRoutes = [
  ['', '', null, ''],
  ["My Metrics", '/mymetrics', null, 'sidebar__nav--back'],
];

const singleRoutes = [
  [strings.back_to_metrics, null, 'sidebar__nav--back']
];

const empty = [['', '']];

const mymetrics = {
  base: 'mymetrics',
  heading: 'My Metrics',
  routes: (currentRoute, params) => {
     if (currentRoute.slice(0, 10) === '/mymetrics') {
      return requestRoutes.map(d => {
        if (typeof d[0] !== 'undefined' && !d[0].match(strings.back_to_requests) &&
            (!d[1] || d[1].indexOf(':requestId') === -1)) {
          return d;
        }
        return empty;
    })} else {
      return routes;
    }
  }
};

export default mymetrics;