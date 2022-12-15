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

const AddUser = ({ dispatch, match, groups, roles }) => {
  const { userId } = match.params;
  useEffect(() => {
    dispatch(listRoles());
    dispatch(listGroups());
  }, []);
  useEffect(() => {
    setRoleOptions(roles.map(({ id, long_name}) => ({value:id, label: long_name})));
    setGroupOptions(groups.map(({id, long_name}) => ({value:id, label: long_name})));
  }, [groups, roles]);
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
      }, '500')
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
                <label className='heading--small'>Username
                    <input type="text" name="username" value={username} onChange={e => setUsername(e.target.value)}
                      onClick = {() => { username === 'Required Input' ? setUsername('') : ''; }}
                      style={{ borderColor: errorCheck(username) }} />
                </label>
                <label className='heading--small'>Email
                    <input type="text" name="email" value={email} onChange={handleEmail}
                      onClick = {() => { email === 'Invalid Email' ? setEmail('') : ''; }}
                      style={{ borderColor: errorCheck(validEmail) }} />
                </label>
                <label className='heading--small'>Name
                    <input type="text" name="name" value={name} onChange={e => setName(e.target.value)}
                      onClick = {() => { name === 'Required Input' ? setName('') : ''; }}
                      style={{ borderColor: errorCheck(name) }} />
                </label>
                <label className='heading--small'>Roles
                  <div style={{width:300}}>
                      <Select
                      options={roleOptions}
                      value={selectedRoles}
                      onChange={handleRoleSelect}
                      isSearchable={true}
                      isMulti={true}
                    />
                  </div>
                </label>
                <label className='heading--small'>Groups
                  <div style={{width:300}}>
                    <Select
                      options={groupOptions}
                      value={selectedGroups}
                      onChange={handleGroupSelect}
                      isSearchable={true}
                      isMulti={true}
                    />
                  </div>
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
  user_groups: state.api.tokens.groups,
  groups: state.groups.list.data,
  roles: state.roles.list.data
}))(AddUser));
