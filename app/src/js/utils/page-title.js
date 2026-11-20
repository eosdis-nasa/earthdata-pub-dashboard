'use strict';

const PAGE_TITLES = [
  [/\/data_publication_guidelines/, 'Data Publication Guidelines'],
  [/\/getting_started/, 'Getting Started'],
  [/\/help/, 'Help'],
  [/\/requests\/id\//, 'Request'],
  [/\/requests/, 'Requests'],
  [/\/form\/questions/, 'Form'],
  [/\/forms/, 'Forms'],
  [/\/daac\/assignment/, 'DAAC assignment'],
  [/\/questions/, 'Questions'],
  [/\/inputs/, 'Inputs'],
  [/\/sections/, 'Sections'],
  [/\/users\/id\//, 'User'],
  [/\/users/, 'Users'],
  [/\/groups\/id\//, 'Group'],
  [/\/groups/, 'Groups'],
  [/\/workflows/, 'Workflows'],
  [/\/metrics/, 'Metrics'],
  [/\/roles/, 'Roles'],
  [/\/conversations/, 'Conversations'],
  [/\/rules/, 'Rules'],
  [/\/modules/, 'Modules'],
  [/\/upload/, 'Upload'],
  [/\/download/, 'Download'],
  [/\/steps/, 'Steps'],
  [/\/auth/, 'Sign in'],
  [/\/logout/, 'Log out'],
  [/\/error/, 'Something went wrong'],
  [/\/404/, 'Page not found'],
  [/^\/$/, 'Dashboard']
];

export function titleForPath (pathname) {
  const path = typeof pathname === 'string' && pathname ? pathname : '/';
  const match = PAGE_TITLES.find(([pattern]) => pattern.test(path));
  const name = match ? match[1] : 'Earthdata Pub';
  return name === 'Earthdata Pub' ? name : `${name} - Earthdata Pub`;
}
