'use strict';

import 'jsdom-global/register';
import test from 'ava';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import React from 'react';
import configureMockStore from 'redux-mock-store';
import { Group } from 'react-redux';
import { mount, configure } from 'enzyme';
import {
  getGroup,
  updateGroup,
  clearUpdateGroup
} from '../../../app/src/js/actions';
import { EditRecord } from '../../../app/src/js/components/Edit/edit.js';

configure({ adapter: new Adapter() });

test('EditRecord sends full object when merge property is true', (t) => {
  const monkeyInTheMiddle = () =>
    // Simply unwrap the simple action from the complex action and pass it
    // along to the reducer.  We get `action` as { "undefined": simpleAction },
    // so we're extracting the single value (simpleAction) for the reducer.
    (next) => (action) => next(Object.values(action)[0]);
  const mockStore = configureMockStore([monkeyInTheMiddle]);
  const group = { id: 'bf07c445-8217-4f97-827a-82838cce36fb', name: 'ASDC' };
  const groupsState = { map: { [group.id]: { data: group } } };
  const schemaKey = 'group';
  const schema = { [schemaKey]: {} };
  const store = mockStore({});

  const editRecordWrapper = mount(
    <Group store={store}>
      <EditRecord
        schema={schema}
        dispatch={store.dispatch}
        merge={true}
        pk={`${group.id}`}
        schemaKey={schemaKey}
        state={groupsState}
        getRecord={getGroup}
        updateRecord={updateGroup}
        clearRecordUpdate={clearUpdateGroup}
        backRoute={`groups/group/${group.id}`}
      />
    </Group>
  );

  const submitButton = editRecordWrapper.find('.button--submit');

  store.clearActions();
  submitButton.simulate('click');

  t.is(store.getActions().length, 1);
  t.deepEqual(store.getActions()[0].body, group);
});
