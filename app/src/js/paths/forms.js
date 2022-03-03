'use strict';
import tally from './tally';
import { strings } from '../components/locale';
const formRoutes = [
  ['', null]
];

const singleFormRoutes = [
  [strings.back_to_submissions, '/requests', 'sidebar__nav--back'],
  [strings.back_to_forms, '/forms', 'sidebar__nav--back'],
];

const empty = [['', '']];

const forms = {
  base: 'forms',
  heading: 'Forms',
  routes: (currentRoute, params, count) => {
    if (currentRoute.indexOf('forms/id') >= 0) {
      return singleFormRoutes;
    } else if (currentRoute.slice(0, 10) !== '/forms') {
      return empty;
    } else {
      count = count || [];
      return formRoutes.map(d => tally(d, count));
    }
  }
};

export default forms;
