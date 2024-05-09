'use strict';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  getUser,
  addUserRole,
  removeUserRole,
  addUserGroup,
  removeUserGroup,
  updateUsername,
  refreshToken
} from '../../actions';
import { userPrivileges } from '../../utils/privileges';
import { lastUpdated, shortDateNoTimeYearFirst } from '../../utils/format';
import SearchModal from '../SearchModal';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import Loading from '../LoadingIndicator/loading-indicator';
import MetadataEditable from '../Table/MetadataEditable';
import { strings } from '../locale';

const addRole = (dispatch, id, roleId) => {
  const payload = {
    id,
    role_id: roleId
  };
  dispatch(addUserRole(payload));
};

const updateUser = (dispatch, id, roleId, name) => {
  const payload = {
    id,
    name
  };
  dispatch(updateUsername(payload));
  dispatch(refreshToken());
};

const removeRole = (dispatch, id, roleId) => {
  const payload = {
    id,
    role_id: roleId
  };
  dispatch(removeUserRole(payload));
};

const addGroup = (dispatch, id, groupId) => {
  const payload = {
    id,
    group_id: groupId
  };
  dispatch(addUserGroup(payload));
};

const removeGroup = (dispatch, id, groupId) => {
  const payload = {
    id,
    group_id: groupId
  };
  dispatch(removeUserGroup(payload));
};

function updateDontShowAgain () {
  if (document.getElementById('dontShowAgain') !== null) {
    let val;
    if (document.getElementById('dontShowAgain').checked) {
      val = 'false';
    } else {
      val = 'true';
    }
    localStorage.setItem('dontShowAgain', val);
  }
}

const User = ({ dispatch, user, privileges, match, groups }) => {
  const { userId } = match.params;
  useEffect(() => {
    dispatch(getUser(userId));
    updateDontShowAgain();
  }, []);
  const [showSearch, setShowSearch] = useState(false);
  const [searchOptions, setSearchOptions] = useState({});
  const { data, inflight, meta } = user || {
    inflight: true,
    data: {
      long_name: 'unknown',
      detailed: false
    },
    meta: {
      queriedAt: 0
    }
  };
  const { canAddRole, canRemoveRole, canAddGroup, canRemoveGroup } = userPrivileges(privileges);
  const addRoleSubmit = (id) => {
    addRole(dispatch, userId, id);
    setShowSearch(false);
  };
  const addGroupSubmit = (id) => {
    addGroup(dispatch, userId, id);
    setShowSearch(false);
  };
  const searchCancel = () => setShowSearch(false);
  const handleAddGroup = () => {
    setSearchOptions({
      entity: 'group',
      cancel: searchCancel,
      submit: addGroupSubmit,
      filters: isAdmin() ? [] : groups.map((group) => group.short_name)
    });
    setShowSearch(true);
  };
  const handleAddRole = () => {
    setSearchOptions({
      entity: 'role',
      cancel: searchCancel,
      submit: addRoleSubmit,
      filters: isAdmin() ? [] : ['admin']
    });
    setShowSearch(true);
  };
  const isAdmin = () => {
    return 'ADMIN' in privileges;
  };
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
      label: data.id || '',
      active: true
    }
  ];
  const metaAccessors = [
    {
      label: 'Name',
      property: 'name',
      accessor: d => {
        return (d || <Loading/>);
      },
      editable: true
    },
    {
      label: 'Email',
      property: 'email',
      accessor: d => {
        return (d || '--');
      },
    },
    {
      label: 'Registered',
      accessor: d => {
        return (shortDateNoTimeYearFirst(d));
      },
      property: 'registered'
    },
    {
      label: 'Last Login',
      accessor: d => {
        return (shortDateNoTimeYearFirst(d));
      },
      property: 'last_login'
    }
  ];
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
            {meta && lastUpdated(meta.queriedAt)}
          </div>
        </section>
        { showSearch && <SearchModal { ...searchOptions }/> }
        {<div className='page__content'>
            <section className='page__section page__section__header-wrapper'>
              <div className='heading__wrapper--border'>
                <h1 className='heading--small' aria-labelledby={strings.user_overview}>
                  {strings.user_overview}
                </h1>
              </div>
              <div className='indented__details'>
              <MetadataEditable data={data} accessors={metaAccessors} userId={userId} dispatch={dispatch} updateUser={updateUser}/>
              </div>
            </section><br />
            <section className='page__section'>
              <div className='page__section__header'>
                <h1 className='heading--small heading--shared-content with-description '>
                  Settings
                </h1>
              </div>
            </section>
            <section className='page__section'>
              <div className='page__section__header'>
                <h1 className='heading--small heading--shared-content with-description '>
                  Groups
                </h1>
              </div>
              <div className='page__content--shortened flex__column'>
                {
                  data.user_groups && data.user_groups.map((group, key) => {
                    return (
                      <div key={key} className='flex__row sm-border'>
                        <div className='flex__item--w-25'>
                          {group.long_name}
                        </div>
                        <div className='flex__item--w-15'>
                          {canRemoveGroup &&
                            <button
                              className='button button--remove button__animation--md button__arrow button__arrow--md button__animation'
                              onClick={() => removeGroup(dispatch, data.id, group.id)}
                              disabled={inflight}>
                              Remove
                            </button>
                          }
                        </div>
                      </div>
                    );
                  })
                }
                { canAddGroup &&
                  <div className='flex__row sm-border'>
                    <div className='flex__item-w-25'>
                      <button
                        className='button button--add button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'
                        onClick={handleAddGroup}
                        disabled={inflight}>
                        Add Group
                      </button>
                    </div>
                  </div>
                }
              </div>
            </section>
            <section className='page__section'>
              <div className='page__section__header'>
                <h1 className='heading--small heading--shared-content with-description '>
                  Roles
                </h1>
              </div>
              <div className='page__content--shortened flex__column'>
                {
                  data.user_roles && data.user_roles.map((role, key) => {
                    return (
                      <div key={key} className='flex__row sm-border'>
                        <div className='flex__item--w-25'>
                          {role.long_name}
                        </div>
                        <div className='flex__item--w-15'>
                          { canRemoveRole && (isAdmin() || role.short_name != 'admin') &&
                            <button
                              className='button button--remove button__animation--md button__arrow button__arrow--md button__animation'
                              onClick={() => removeRole(dispatch, data.id, role.id)}
                              disabled={inflight}>
                              Remove
                            </button>
                          }
                        </div>
                      </div>
                    );
                  })
                }
                { canAddRole &&
                  <div className='flex__row sm-border'>
                    <div className='flex__item--w-25'>
                      <button
                        className='button button--add button__animation--md button__arrow button__arrow--md button__animation button__arrow--white add-role'
                        onClick={handleAddRole}
                        disabled={inflight}>
                        Add Role
                      </button>
                    </div>
                  </div>
                }
              </div>
            </section>
          </div>
        }
      </div>
    </div>
  );
};

User.propTypes = {
  dispatch: PropTypes.func,
  user: PropTypes.object,
  privileges: PropTypes.object,
  match: PropTypes.object,
  groups: PropTypes.array
};

export default withRouter(connect(state => ({
  user: state.users.detail,
  privileges: state.api.tokens.privileges,
  groups: state.api.tokens.groups
}))(User));
