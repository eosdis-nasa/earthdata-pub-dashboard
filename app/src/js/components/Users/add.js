'use strict';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  listRoles,
  listGroups,
  createUser
} from '../../actions';
import SearchModal from '../SearchModal';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import Select from 'react-select';
import { userPrivileges } from '../../utils/privileges';

const AddUser = ({ dispatch, match, groups, roles, privileges, newUserStatus }) => {
  const { userId } = match.params;
  useEffect(() => {
    dispatch(listRoles());
    dispatch(listGroups());
  }, []);

  useEffect(() => {
    setRoleOptions(roles.map(({ id, long_name }) => ({ value: id, label: long_name })));
    setGroupOptions(groups.map(({ id, long_name }) => ({ value: id, label: long_name })));
  }, [groups, roles]);

  useEffect(() => {
    if (newUserStatus.error === 'Duplicate email' && email) {
      setValidEmail(false);
      setEmail(email ? 'Email already exits' : '');
      setMissingReq(true);
    } else if (newUserStatus.name === name) {
      history.push('/users');
    }
  }, [newUserStatus]);

  const history = useHistory();
  const [showSearch, setShowSearch] = useState(false);
  const [searchOptions, setSearchOptions] = useState({});
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [validEmail, setValidEmail] = useState(true);
  const [name, setName] = useState('');
  const [missingReq, setMissingReq] = useState(false);
  const [roleOptions, setRoleOptions] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);

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

  const extractId = (list) => {
    const rtnList = [];
    list.forEach(item => {
      rtnList.push(item.value);
    });
    return rtnList;
  };

  const handleRoleSelect = (data) => {
    setSelectedRoles(data);
  };

  const handleGroupSelect = (data) => {
    setSelectedGroups(data);
  };

  const handleEmail = (event) => {
    const input = event.target.value;
    setEmail(input);
    setValidEmail(input.match(/^\S+@\S+\.\S+$/));
  };

  const handleEmailClick = () => {
    if (email === 'Invalid Email' || email === 'Email already exits') {
      setEmail('');
    }
  };

  const handleSubmit = () => {
    if (validEmail && name && username && email) {
      const payload = {
        email: email,
        name: name,
        username: username,
        role_ids: extractId(selectedRoles),
        group_ids: extractId(selectedGroups)
      };
      dispatch(createUser(payload));
      history.push('/users');
      setTimeout(() => {
        window.location.reload(false);
      }, '500');
    } else {
      !name ? setName('Required Input') : '';
      !username ? setUsername('Required Input') : '';
      if (!email || !validEmail) {
        setValidEmail(false);
        setEmail('Invalid Email');
      }
      setMissingReq(true);
    }
  };

  const errorCheck = (failCondition) => {
    const borderColor = (!failCondition || failCondition === 'Required Input') && missingReq ? '#DB1400' : '';
    return borderColor;
  };
  const { canCreate } = userPrivileges(privileges);
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
              <section className='page__section page__section__controls user-section'>
                <div className='heading__wrapper--border'>
                  <h2 className='heading--medium heading--shared-content with-description'>Add User</h2>
                </div>
                <label className='heading--small' htmlFor="username">Username</label>
                <input type="text" id="username" name="username" value={username} onChange={e => setUsername(e.target.value)}
                  onClick = {() => { username === 'Required Input' ? setUsername('') : ''; }}
                  style={{ borderColor: errorCheck(username) }} />
                <label className='heading--small' htmlFor="email">Email</label>
                <input type="text" name="email" id="email" value={email} onChange={handleEmail}
                  onClick = {() => { email === 'Invalid Email' ? setEmail('') : ''; }}
                  style={{ borderColor: errorCheck(validEmail) }} />
                <label className='heading--small' htmlFor="name">Name</label>
                <input type="text" name="name" id="name" value={name} onChange={e => setName(e.target.value)}
                  onClick = {() => { name === 'Required Input' ? setName('') : ''; }}
                  style={{ borderColor: errorCheck(name) }} />
                <label className='heading--small'>Roles
                <Select
                  id="roleSelect"
                  options={roleOptions}
                  value={selectedRoles}
                  onChange={handleRoleSelect}
                  isSearchable={true}
                  isMulti={true}
                  className='selectButton'
                  placeholder='Select Roles ...'
                  aria-label='Select Roles'
                /></label>
                <label className='heading--small'>Groups
                <Select
                id="groupSelect"
                  options={groupOptions}
                  value={selectedGroups}
                  onChange={handleGroupSelect}
                  isSearchable={true}
                  isMulti={true}
                  className='selectButton'
                  placeholder='Select Groups ...'
                  aria-label='Select Groups'
                /></label>
              </section>
              {
                canCreate
                  ? <section className='page__section'>
                  <Link className={'button button--cancel button__animation--md button__arrow button__arrow--md button__animation button--secondary'}
                  to={'/users'} id='cancelButton' aria-label="cancel user editing">
                      Cancel
                  </Link>
                  <button className={'button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'}
                  onClick={handleSubmit} aria-label="submit your user">
                      Submit
                  </button>
                </section>
                  : null
              }
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
  roles: PropTypes.array,
  newUserStatus: PropTypes.object
};

export default withRouter(connect(state => ({
  user: state.users.detail,
  privileges: state.api.tokens.privileges,
  user_groups: state.api.tokens.groups,
  groups: state.groups.list.data,
  roles: state.roles.list.data,
  newUserStatus: state.users.detail.data
}))(AddUser));
