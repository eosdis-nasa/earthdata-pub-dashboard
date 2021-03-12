'use strict';
import { strings } from '../components/locale';

const routes = [
  ['', null]
];

const singleRoutes = [
  [strings.back_to_conversations, null, 'sidebar__nav--back']
];

const empty = [['', '']];

const handler = {
  base: 'conversations',
  heading: 'Conversations',
  routes: (currentRoute, params) => {
    if (currentRoute.indexOf('conversations/id') >= 0) {
      return singleRoutes;
    } else if (currentRoute.slice(0, 8) !== '/conversations') {
      return empty;
    } else {
      return routes;
    }
  }
};

export default handler;
