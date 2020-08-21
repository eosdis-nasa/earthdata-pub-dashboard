'use strict';

import test from 'ava';
import rewire from 'rewire';
import sinon from 'sinon';
import cloneDeep from 'lodash.clonedeep';

const submissions = rewire('../../../app/src/js/utils/table-config/submissions');

const setOnConfirm = submissions.__get__('setOnConfirm');

test.beforeEach((t) => {
  t.context.history = {};
  t.context.history.push = sinon.fake();
  t.context.history.location = { pathname: '/submissions' };
});

test.afterEach((t) => {
  sinon.restore();
});

test('setOnConfirm does nothing with an error', (t) => {
  const input = { history: t.context.history, error: true };
  const confirmCallback = setOnConfirm(input);

  confirmCallback();

  t.true(t.context.history.push.notCalled);
});

test('setOnConfirm navigates to the target submission with a single selected submission', (t) => {
  const input = { history: t.context.history, selected: ['one-submission'] };
  const confirmCallback = setOnConfirm(input);

  confirmCallback();

  t.true(t.context.history.push.calledWith('/submissions/submission/one-submission'));
});

test('setOnConfirm navigates to the processing page with multiple selected submissions', (t) => {
  const input = {
    history: t.context.history,
    selected: ['one-submission', 'two-submission']
  };
  const confirmCallback = setOnConfirm(input);

  confirmCallback();

  t.true(t.context.history.push.calledWith('/submissions/processing'));
});

test('setOnConfirm calls setState to close the modal with multiple selected submissions', (t) => {
  const input = {
    history: t.context.history,
    selected: ['one-submission', 'two-submission'],
    closeModal: sinon.fake()
  };
  const confirmCallback = setOnConfirm(input);

  confirmCallback();
  t.true(t.context.history.push.calledWith('/submissions/processing'));
  t.true(input.closeModal.called);
});

test('setOnConfirm navigates to the correct processing page irrespective of the current location.', (t) => {
  const input = {
    history: t.context.history,
    selected: ['one-submission', 'two-submission']
  };

  const locationExpects = [
    {
      pathname: 'collections/collection/MOD09GQ/006/submissions/completed',
      expected: 'collections/collection/MOD09GQ/006/submissions/processing'
    },
    {
      pathname: 'collections/collection/MOD09GQ/006/submissions/processing',
      expected: 'collections/collection/MOD09GQ/006/submissions/processing'
    },
    {
      pathname: 'collections/collection/MOD09GQ/006',
      expected: 'collections/collection/MOD09GQ/006/submissions/processing'
    },
    {
      pathname: 'collections/collection/MOD09GQ/006/submissions',
      expected: 'collections/collection/MOD09GQ/006/submissions/processing'
    },
    {
      pathname: '/submissions/completed',
      expected: '/submissions/processing'
    }
  ];

  locationExpects.forEach((o) => {
    const testInput = cloneDeep(input);
    testInput.history.location.pathname = o.pathname;
    const confirmCallback = setOnConfirm(testInput);
    confirmCallback();
    t.true(t.context.history.push.calledWith(o.expected));
  });
});
