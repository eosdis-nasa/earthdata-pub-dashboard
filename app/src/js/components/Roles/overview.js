'use strict';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { lastUpdated } from '../../utils/format';
import {
  listRoles,
} from '../../actions';
import List from '../Table/Table';
// import Search from '../Search/search';
import { tableColumns } from '../../utils/table-config/roles';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

const breadcrumbConfig = [
  {
    label: 'Dashboard Home',
    href: '/'
  },
  {
    label: 'Roles',
    active: true
  }
];

const RoleOverview = ({ roles }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(listRoles());
  }, [roles.searchString, dispatch]);
  const { queriedAt } = roles.list.meta;
  return (
    <div className='page__component'>
      <section className='page__section page__section__controls'>
        <Breadcrumbs config={breadcrumbConfig} />
      </section>
      <section className='page__section page__section__header-wrapper'>
        <div className='page__section__header'>
          <h1 className='heading--large heading--shared-content with-description '>{strings.role_overview}</h1>
          {lastUpdated(queriedAt)}
        </div>
      </section>
      <section className='page__section'>
        <div className='heading__wrapper--border'>
          <h2 className='heading--medium heading--shared-content with-description'>{strings.all_roles} <span className='num--title'>{roles.list.data.length}</span></h2>
        </div>
        <List
          list={roles.list}
          dispatch={dispatch}
          action={listRoles}
          tableColumns={tableColumns}
          query={{}}
          rowId='name'
          filterIdx='short_name'
          filterPlaceholder='Search Role'
        />
      </section>
    </div>
  );
};

RoleOverview.propTypes = {
  dispatch: PropTypes.func,
  roles: PropTypes.object
};

export default withRouter(connect(
  (state) => ({ roles: state.roles })
)(RoleOverview));
