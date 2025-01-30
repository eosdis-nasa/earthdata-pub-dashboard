'use strict';
import { encode } from '../utils/browser';
import tally from './tally';
import { strings } from '../components/locale';

const stepsRoutes = [
  ['', null]
];

const singleStepRoutes = [
  [strings.back_to_requests, '/requests', 'sidebar__nav--back'],
  [strings.back_to_steps, '/steps', 'sidebar__nav'],
];

const empty = [['', '']];

const steps = {
  base: 'steps',
  heading: strings.steps,
  routes: (currentRoute, params, count) => {
    if (currentRoute.indexOf('steps/id') >= 0) {
      return singleStepRoutes.map(d => {
        if (!d[1] || d[1].indexOf(':stepId') === -1) return d;
        const copy = d.slice();
        copy[1] = encode(copy[1].replace(':stepId', params.stepId));
        return copy;
      });
    } else if (currentRoute.slice(0, 9) === '/steps') {
      count = count || [];
      return stepsRoutes.map(d => tally(d, count));
    } else {
      return empty;
    }
  }
};

export default steps;
