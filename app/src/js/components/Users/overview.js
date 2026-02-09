'use strict';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import {
  listGroups,
  listRoles,
  getUsers
} from '../../actions';
import { lastUpdated } from '../../utils/format';
import { tableColumns } from '../../utils/table-config/users';
import List from '../Table/Table';
// import Overview from '../Overview/overview';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { userPrivileges } from '../../utils/privileges';
import Select from 'react-select';

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

const UsersOverview = ({ users, privileges, groups, roles }) => {
  const [groupOptions, setGroupOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const userQueryFields = 'id,name,email,registered,last_login,group_ids,role_ids,detailed';
  const dispatch = useDispatch();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  useEffect(() => {
    dispatch(getUsers({ query_fields: userQueryFields }));
  }, [users.searchString, dispatch]);
  const { queriedAt } = users.list.meta;
  const { canCreate } = userPrivileges(privileges);

  useEffect(() => {
    dispatch(listRoles());
    dispatch(listGroups());
  }, [dispatch]);

  useEffect(() => {
    const optionList = groups.map((entry) => {
      return { value: entry.id, label: entry.long_name };
    });
    setGroupOptions(optionList);
  }, [groups]);

  useEffect(() => {
    const optionList = roles.map((entry) => {
      return { value: entry.id, label: entry.long_name };
    });
    setRoleOptions(optionList);
  }, [roles]);

  useEffect(() => {
    const filterList = async () => {
      const queryStringArgs = {
        query_fields: userQueryFields,
        ...(selectedGroup === null ? {} : { group_id: selectedGroup.value }),
        ...(selectedRole === null ? {} : { role_id: selectedRole.value })
      };

      dispatch(getUsers(queryStringArgs));
    };

    filterList();
  }, [selectedGroup, selectedRole, dispatch]);

  const handleGroupSelect = (data) => {
    setSelectedGroup(data);
  };

  const handleRoleSelect = (data) => {
    setSelectedRole(data);
  };

  return (
    <div className='page__component'>
      <section className='page__section page__section__controls'>
        <Breadcrumbs config={breadcrumbConfig} />
      </section>
      <section className='page__section page__section__header-wrapper'>
        <div className='page__section__header'>
          <h1 className='heading--large heading--shared-content with-description '>Users</h1>
          {lastUpdated(queriedAt)}
        </div>
      </section>
      <section className='page__section'>
        <div className='heading__wrapper--border'>
          <h2 className='heading--medium heading--shared-content with-description'>{strings.all_users} <span className='num--title'>{users.list.data.length}</span></h2>
          {
            canCreate
              ? <Link
                className='button button--small button--green button--add-small form-group__element--right new-request-button' to={{ pathname: '/users/add' }}
            >Add User
            </Link>
              : null
          }
        </div>
        <List
          list={users.list}
          dispatch={dispatch}
          action={() => getUsers({ query_fields: userQueryFields })}
          tableColumns={tableColumns}
          query={{}}
          rowId='id'
          filterIdx='name'
          filterPlaceholder='Search Users'
        >
          <div className="filterGrid" style={{ padding: '1em 0' }}>
            <label>Group
            <Select
              id="groupSelect"
              options={groupOptions}
              value={selectedGroup}
              onChange={handleGroupSelect}
              isSearchable={true}
              isMulti={false}
              isClearable={true}
              className='selectButton'
              placeholder='Select Group ...'
              aria-label='Select Group'
            /></label>
            <label className='heading--small'>Roles
            <Select
              id="roleSelect"
              options={roleOptions}
              value={selectedRole}
              onChange={handleRoleSelect}
              isSearchable={true}
              isMulti={false}
              isClearable={true}
              className='selectButton'
              placeholder='Select Role ...'
              aria-label='Select Role'
            /></label>
          </div>
        </List>
      </section>
    </div>
  );
};

UsersOverview.propTypes = {
  users: PropTypes.object,
  stats: PropTypes.object,
  dispatch: PropTypes.func,
  config: PropTypes.object,
  privileges: PropTypes.object,
  groups: PropTypes.array,
  roles: PropTypes.array
};

export { UsersOverview };

export default withRouter(connect(state => ({
  stats: state.stats,
  users: state.users,
  privileges: state.api.tokens.privileges,
  config: state.config,
  groups: state.groups.list.data,
  roles: state.roles.list.data
}))(UsersOverview));
