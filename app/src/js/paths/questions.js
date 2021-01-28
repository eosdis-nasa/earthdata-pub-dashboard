'use strict';
import { encode } from '../utils/browser';
import tally from './tally';
import { strings } from '../components/locale';

const questionsRoutes = [
  ['', null]
];

const singleQuestionRoutes = [
  [strings.back_to_questions, null, 'sidebar__nav--back']
];

const empty = [['', '']];

const questions = {
  base: 'questions',
  heading: strings.questions,
  routes: (currentRoute, params, count) => {
    if (currentRoute.indexOf('questions/question') >= 0) {
      return singleQuestionRoutes.map(d => {
        if (!d[1] || d[1].indexOf(':questionId') === -1) return d;
        const copy = d.slice();
        copy[1] = encode(copy[1].replace(':questionId', params.questionId));
        return copy;
      });
    } else if (currentRoute.slice(0, 9) === '/questions') {
      count = count || [];
      return questionsRoutes.map(d => tally(d, count));
    } else {
      return empty;
    }
  }
};

export default questions;
