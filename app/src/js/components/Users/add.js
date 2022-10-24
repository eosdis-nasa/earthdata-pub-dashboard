'use strict';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  addUserRole,
  addUserGroup,
  listRoles,
  listGroups
} from '../../actions';
import { userPrivileges } from '../../utils/privileges';
import SearchModal from '../SearchModal';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';


const AddUser = ({ dispatch, user, privileges, match, user_groups, groups, roles }) => {
  const { userId } = match.params;
  useEffect(() => {
    dispatch(listRoles());
    dispatch(listGroups());
  }, []);
  const [showSearch, setShowSearch] = useState(false);
  const [searchOptions, setSearchOptions] = useState({});
  const { canAddRole, canRemoveRole, canAddGroup, canRemoveGroup } = userPrivileges(privileges);
  const searchCancel = () => setShowSearch(false);
  const isAdmin = () => {
    return 'ADMIN' in privileges;
  };

  const testRoles = ['role', 'test', 'here'];
  const testGroups = ['groups', 'test', 'here'];

  const breadcrumbConfig = [
    {
      label: 'Dashboard Home',
      href: '/'
    },
    {
      label: 'Users',
      href: '/users'
    },
    {
      label: 'Add User',
      active: true
    }
  ];

  const handleSubmit = () => {
    console.log('Add JSON build logic and query  here');
    console.log(roles);
    console.log(groups);
  }
  
  return (
    <div className='page__content'>
      <div className='page__component'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <section className='page__section page__section__header-wrapper'>
          <div className='page__section__header'>
            <h1 className='heading--large heading--shared-content with-description '>
              User Overview
            </h1>
          </div>
        </section>
        { showSearch && <SearchModal { ...searchOptions }/> }
        {// TODO - Prettify this page and make it functional. Need to build json to send here on front end to send
         // JSON will follow the below format where role_id and group_id are optional parameters:
        // {
        // "email": email_value, 
        // "name": name_value,
        // "username": username_value,
        // "role_id": role_id,
        // "group_id": group_id
        // }
            <div className='page__content'>
            <section className='page__section'>
              <div className='page__section__header'>
                <h1 className='heading--small heading--shared-content with-description '>
                  User Details
                </h1>
                <form>
                <label className='heading--small'>Username:
                    <input type="text" name="username" />
                </label>
                <label className='heading--small'>Email:
                    <input type="text" name="email" />
                </label>
                <label className='heading--small'>Name:
                    <input type="text" name="name" />
                </label>
                <label className='heading--small'>Roles
                    <select>
                        {roles.map((role, idx) => {
                            return <option value={role.long_name} key={idx}>{role.long_name}</option>
                        })}
                    </select>
                </label>
                <label className='heading--small'>Groups
                    <select>
                        {groups.map((group, idx) => {
                            return <option value={group.long_name} key={idx}>{group.long_name}</option>
                        })}
                    </select>
                </label>
                </form>
              </div>
            </section>
            <section className='page__section'>
                  <Link className={'button button--cancel button__animation--md button__arrow button__arrow--md button__animation button--secondary'}
                  to={'/users'} id='cancelButton' aria-label="cancel user editing">
                      Cancel
                  </Link>
                  <button className={'button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'}
                  onClick={handleSubmit} aria-label="submit your user">
                      Submit
                  </button>
                </section>
          </div>
        }
      </div>
    </div>
  );
};

AddUser.propTypes = {
  dispatch: PropTypes.func,
  user: PropTypes.object,
  privileges: PropTypes.object,
  match: PropTypes.object,
  user_groups: PropTypes.array,
  groups: PropTypes.array,
  roles: PropTypes.array
};

export default withRouter(connect(state => ({
  user: state.users.detail,
  privileges: state.api.tokens.privileges,
  user_groups:state.api.tokens.groups,
  groups: state.groups.list.data,
  roles: state.roles.list.data
}))(AddUser));
