'use strict';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import {
  // getCount,
  // searchGroups,
  // clearGroupsSearch,
  // filterGroups,
  // clearGroupsFilter,
  listGroups
} from '../../actions';
import { lastUpdated } from '../../utils/format';
import { tableColumns } from '../../utils/table-config/groups';
import List from '../Table/Table';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

const breadcrumbConfig = [
  {
    label: 'Dashboard Home',
    href: '/'
  },
  {
    label: 'Groups',
    active: true
  }
];

const GroupsOverview = ({ groups }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(listGroups());
  }, [groups.searchString, dispatch]);
  const { queriedAt } = groups.list.meta;
  return (
    <div className='page__component'>
      <section className='page__section page__section__controls'>
        <Breadcrumbs config={breadcrumbConfig} />
      </section>
      <section className='page__section page__section__header-wrapper'>
        <div className='page__section__header'>
          <h1 className='heading--large heading--shared-content with-description '>Groups</h1>
          {lastUpdated(queriedAt)}
        </div>
      </section>
      <section className='page__section'>
        <div className='heading__wrapper--border'>
          <h2 className='heading--medium heading--shared-content with-description'>{strings.all_groups} <span className='num--title'>{groups.list.data.length}</span></h2>
        </div>
        <List
          list={groups.list}
          dispatch={dispatch}
          action={listGroups}
          tableColumns={tableColumns}
          query={{}}
          rowId='id'
          filterIdx='short_name'
          filterPlaceholder='Search Group'
        >
        </List>
      </section>
    </div>
  );
};

GroupsOverview.propTypes = {
  groups: PropTypes.object,
  stats: PropTypes.object,
  dispatch: PropTypes.func,
  config: PropTypes.object
};

export { GroupsOverview };

export default withRouter(connect(state => ({
  stats: state.stats,
  groups: state.groups,
  config: state.config
}))(GroupsOverview));
