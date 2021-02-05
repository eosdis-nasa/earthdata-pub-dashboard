'use strict';
import { encode } from '../utils/browser';
// import tally from './tally';
import { strings } from '../components/locale';

/* const submissionRoutes = [
  ['', null],
  ['Completed', 'completed', (d) => d.key === 'completed'],
  ['Running', 'processing', (d) => d.key === 'running'],
  ['Failed', 'failed', (d) => d.key === 'failed']
]; */

const singleSubmissionRoutes = [
  [strings.back_to_submissions, null, 'sidebar__nav--back']
];

const empty = [['', '']];

const requests = {
  base: 'requests',
  heading: strings.requests,
  routes: (currentRoute, params, count) => {
    if (currentRoute.indexOf('requests/id') >= 0) {
      return singleSubmissionRoutes.map(d => {
        if (!d[1] || d[1].indexOf(':id') === -1) return d;
        const copy = d.slice();
        copy[1] = encode(copy[1].replace(':id', params.id));
        return copy;
      });
    } else if (currentRoute.slice(0, 9) === '/requests') {
      count = count || [];
      return empty;
      // return submissionRoutes.map(d => tally(d, count));
    } else {
      return empty;
    }
  }
};

export default requests;
