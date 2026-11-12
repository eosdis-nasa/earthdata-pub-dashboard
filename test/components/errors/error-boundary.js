'use strict';

import test from 'ava';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import React from 'react';
import { mount, configure } from 'enzyme';
import ErrorBoundary from '../../../app/src/js/components/Errors/ErrorBoundary';
import { crashReportPayload, crashReportSubject, createErrorReferenceId, openFeedbackForm } from '../../../app/src/js/utils/feedback';

configure({ adapter: new Adapter() });

class Boom extends React.Component {
  render () {
    throw new Error('form answer secret-token');
  }
}

test.beforeEach(() => {
  window.scrollTo = () => {};
  delete window.feedback;
});

test('crashReportSubject keeps only a reference id', (t) => {
  t.is(crashReportSubject('EDP-A1B2C3D4'), 'Earthdata Pub problem EDP-A1B2C3D4');
  t.is(crashReportSubject('EDP-20261109T151305Z-A1B2C3D4'), 'Earthdata Pub problem EDP-20261109T151305Z-A1B2C3D4');
  t.is(crashReportSubject('secret-token form answer'), 'Earthdata Pub problem');
  t.is(crashReportSubject('EDP-A1B2C3D4 secret-token'), 'Earthdata Pub problem');
  t.is(crashReportSubject(''), 'Earthdata Pub problem');
});

test('an error reference is a time plus a short id', (t) => {
  const id = createErrorReferenceId(new Date('2026-11-09T15:13:05.123Z'));
  t.regex(id, /^EDP-20261109T151305Z-[0-9A-F]{8}$/);
  const payload = crashReportPayload(id, {
    page: '/error?token=secret-token',
    kind: 'request',
    errorMessage: 'form answer secret-token'
  });
  t.is(payload.subject, `Earthdata Pub problem ${id}`);
  t.true(payload.details.includes('A request failed, so I opened this report.'));
  t.true(payload.details.includes(`Reference: ${id}`));
  t.true(payload.details.includes('Page: /'));
  t.false(payload.details.includes('secret-token'));
});

test('crash report drops query strings, stacks, and form answers', (t) => {
  const payload = crashReportPayload('EDP-A1B2C3D4', {
    page: '/requests?token=secret-token',
    errorName: 'TypeError',
    component: 'FormQuestions',
    errorMessage: 'form answer secret-token'
  });
  t.is(payload.subject, 'Earthdata Pub problem EDP-A1B2C3D4');
  t.true(payload.details.includes('Reference: EDP-A1B2C3D4'));
  t.true(payload.details.includes('Page: /'));
  t.false(payload.details.includes('secret-token'));
  t.is(payload.metadata.page, '/');
  t.is(payload.metadata.errorName, 'TypeError');
  t.is(payload.metadata.component, 'FormQuestions');
  t.false(Object.prototype.hasOwnProperty.call(payload.metadata, 'errorMessage'));
  t.false(JSON.stringify(payload).includes('secret-token'));
});

test('a render error shows the crash screen without the stack', (t) => {
  const originalError = console.error;
  console.error = () => {};
  let wrapper;
  try {
    wrapper = mount(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
  } finally {
    console.error = originalError;
  }

  const text = wrapper.text();
  t.true(text.includes('We\'re sorry'));
  t.true(text.includes('Report a problem'));
  t.false(text.includes('secret-token'));
  t.false(text.includes('form answer'));
  t.false(text.includes('componentStack'));
  t.regex(wrapper.find('[data-testid="crash-reference"]').text(), /^EDP-[0-9A-F]{8}$/);
  wrapper.unmount();
});

test('Report a problem opens Feedback with the reference id only', (t) => {
  const originalError = console.error;
  console.error = () => {};
  const calls = [];
  window.feedback = {
    showForm: (payload) => {
      calls.push(payload);
    }
  };

  let wrapper;
  try {
    wrapper = mount(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
  } finally {
    console.error = originalError;
  }

  const referenceId = wrapper.find('[data-testid="crash-reference"]').text();
  wrapper.find('button').filterWhere((node) => node.text() === 'Report a problem').simulate('click');

  t.is(calls.length, 1);
  t.is(calls[0].subject, `Earthdata Pub problem ${referenceId}`);
  t.true(calls[0].details.includes(`Reference: ${referenceId}`));
  t.true(calls[0].details.includes('What I was doing:'));
  t.is(calls[0].metadata.referenceId, referenceId);
  t.false(JSON.stringify(calls[0]).includes('secret-token'));
  t.false(JSON.stringify(calls[0]).includes('componentStack'));
  wrapper.unmount();
});

test('openFeedbackForm without a subject still opens Feedback', (t) => {
  const calls = [];
  window.feedback = {
    showForm: (...args) => {
      calls.push(args);
    }
  };
  openFeedbackForm({ preventDefault () {} });
  t.deepEqual(calls, [[]]);
});

test('children render when nothing throws', (t) => {
  const wrapper = mount(
    <ErrorBoundary>
      <p className="ok">Hello</p>
    </ErrorBoundary>
  );
  t.is(wrapper.find('.ok').text(), 'Hello');
  t.false(wrapper.exists('.crash-screen'));
  wrapper.unmount();
});
