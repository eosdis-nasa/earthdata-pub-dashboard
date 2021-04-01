'use strict';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import {
  // getCount,
  // searchUsers,
  // clearUsersSearch,
  // filterUsers,
  // clearUsersFilter,
  listUsers
} from '../../actions';
import { lastUpdated } from '../../utils/format';
import { tableColumns } from '../../utils/table-config/users';
import List from '../Table/Table';
// import Overview from '../Overview/overview';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

const breadcrumbConfig = [
  {
    label: 'Dashboard Home',
    href: '/'
  },
  {
    label: 'Users',
    active: true
  }
];

const UsersOverview = ({ users }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(listUsers());
  }, [users.searchString, dispatch]);
  const { queriedAt } = users.list.meta;
  return (
    <div className='page__component'>
      <section className='page__section page__section__controls'>
        <Breadcrumbs config={breadcrumbConfig} />
      </section>
      <section className='page__section page__section__header-wrapper'>
        <div className='page__section__header'>
          <h1 className='heading--large heading--shared-content with-description '>{strings.user_overview}</h1>
          {lastUpdated(queriedAt)}
        </div>
      </section>
      <section className='page__section'>
        <div className='heading__wrapper--border'>
          <h2 className='heading--medium heading--shared-content with-description'>{strings.all_users} <span className='num--title'>{users.list.data.length}</span></h2>
        </div>
        <List
          list={users.list}
          dispatch={dispatch}
          action={listUsers}
          tableColumns={tableColumns}
          query={{}}
          rowId='id'
          sortIdx='long_name'
        >
        </List>
      </section>
    </div>
  );
};

UsersOverview.propTypes = {
  users: PropTypes.object,
  stats: PropTypes.object,
  dispatch: PropTypes.func,
  config: PropTypes.object
};

export { UsersOverview };

export default withRouter(connect(state => ({
  stats: state.stats,
  users: state.users,
  config: state.config
}))(UsersOverview));
