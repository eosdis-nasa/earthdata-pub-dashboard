'use strict';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { tally } from '../../utils/format';
import {
  listRoles,
  // searchRoles,
  // clearRolesSearch
} from '../../actions';
import List from '../Table/Table';
// import Search from '../Search/search';
import { tableColumns } from '../../utils/table-config/roles';

const RoleOverview = ({ roles }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(listRoles());
  }, [roles.searchString, dispatch]);
  const count = roles.list.data.length;

  return (
    <div className='page__component'>
      <section className='page__section page__section__header-wrapper'>
        <h1 className='heading--large heading--shared-content with-description'>Roles</h1>
      </section>
      <section className='page__section'>
        <div className='heading__wrapper--border'>
          <h2 className='heading--medium heading--shared-content with-description'>All Roles <span className='num--title'>{count ? ` ${tally(count)}` : 0}</span></h2>
        </div>
        {/* Someone needs to define the search parameters for workflows, e.g. steps, collections, granules, etc. } */}
        {/* <div className='filters'>
          <Search
            dispatch={dispatch}
            action={searchRoles}
            clear={clearRolesSearch}
            label='Search'
            placeholder="Role Name"
          />
        </div> */}

        <List
          list={roles.list}
          dispatch={dispatch}
          action={listRoles}
          tableColumns={tableColumns}
          query={{}}
          sortIdx='name'
          rowId='name'
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
