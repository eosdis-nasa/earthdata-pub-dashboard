'use strict';

/* import test from 'ava';
import rewire from 'rewire';
import sinon from 'sinon';
import cloneDeep from 'lodash.clonedeep';

const requests = rewire('../../../app/src/js/utils/table-config/requests');

const setOnConfirm = requests.__get__('setOnConfirm');

test.beforeEach((t) => {
  t.context.history = {};
  t.context.history.push = sinon.fake();
  t.context.history.location = { pathname: '/requests' };
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

test('setOnConfirm navigates to the target request with a single selected request', (t) => {
  const input = { history: t.context.history, selected: ['one-request'] };
  const confirmCallback = setOnConfirm(input);

  confirmCallback();

  t.true(t.context.history.push.calledWith('/requests/id/one-request'));
});

test('setOnConfirm navigates to the processing page with multiple selected requests', (t) => {
  const input = {
    history: t.context.history,
    selected: ['one-request', 'two-request']
  };
  const confirmCallback = setOnConfirm(input);

  confirmCallback();

  t.true(t.context.history.push.calledWith('/requests/processing'));
});

test('setOnConfirm calls setState to close the modal with multiple selected requests', (t) => {
  const input = {
    history: t.context.history,
    selected: ['one-request', 'two-request'],
    closeModal: sinon.fake()
  };
  const confirmCallback = setOnConfirm(input);

  confirmCallback();
  t.true(t.context.history.push.calledWith('/requests/processing'));
  t.true(input.closeModal.called);
});

test('setOnConfirm navigates to the correct processing page irrespective of the current location.', (t) => {
  const input = {
    history: t.context.history,
    selected: ['one-request', 'two-request']
  };

  const locationExpects = [
    {
      pathname: 'collections/collection/MOD09GQ/006/requests/completed',
      expected: 'collections/collection/MOD09GQ/006/requests/processing'
    },
    {
      pathname: 'collections/collection/MOD09GQ/006/requests/processing',
      expected: 'collections/collection/MOD09GQ/006/requests/processing'
    },
    {
      pathname: 'collections/collection/MOD09GQ/006',
      expected: 'collections/collection/MOD09GQ/006/requests/processing'
    },
    {
      pathname: 'collections/collection/MOD09GQ/006/requests',
      expected: 'collections/collection/MOD09GQ/006/requests/processing'
    },
    {
      pathname: '/requests/completed',
      expected: '/requests/processing'
    }
  ];

  locationExpects.forEach((o) => {
    const testInput = cloneDeep(input);
    testInput.history.location.pathname = o.pathname;
    const confirmCallback = setOnConfirm(testInput);
    confirmCallback();
    t.true(t.context.history.push.calledWith(o.expected));
  });
}); */
