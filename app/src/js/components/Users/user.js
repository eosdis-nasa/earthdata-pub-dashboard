'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import {
  interval,
  getUser,
  deleteUser
} from '../../actions';
import { get } from 'object-path';
import {
  fromNow,
  lastUpdated,
  deleteText
} from '../../utils/format';
import Table from '../SortableTable/SortableTable';
import Loading from '../LoadingIndicator/loading-indicator';
import AsyncCommands from '../DropDown/dropdown-async-command';
import ErrorReport from '../Errors/report';
import Metadata from '../Table/Metadata';
import _config from '../../config';

const { updateInterval } = _config;

const groupTableColumns = [
  {
    Header: 'Table Name',
    accessor: row => row,
  }
];

const permissionTableColumns = [
  {
    Header: 'Table Name',
    accessor: row => row
  }
];

const subscriptionTableColumns = [
  {
    Header: 'Table Name',
    accessor: row => row,
  }
];

const metaAccessors = [
  {
    label: 'User Name',
    property: 'userName'
  },
  {
    label: 'Email',
    property: 'email'
  },
  {
    label: 'Created',
    property: 'createdAt',
    accessor: fromNow
  },
  {
    label: 'Updated',
    property: 'updatedAt',
    accessor: fromNow
  }
];

class UserOverview extends React.Component {
  constructor () {
    super();
    this.reload = this.reload.bind(this);
    this.navigateBack = this.navigateBack.bind(this);
    this.delete = this.delete.bind(this);
    this.errors = this.errors.bind(this);
  }

  componentDidMount () {
    const { userId } = this.props.match.params;
    const immediate = !this.props.users.map[userId];
    this.reload(immediate);
    /* this.props.dispatch(listCollections({
      limit: 100,
      fields: 'collectionName',
      users: userId
    })); */
  }

  componentWillUnmount () {
    if (this.cancelInterval) { this.cancelInterval(); }
  }

  reload (immediate, timeout) {
    timeout = timeout || updateInterval;
    const userId = this.props.match.params.userId;
    const { dispatch } = this.props;
    if (this.cancelInterval) { this.cancelInterval(); }
    this.cancelInterval = interval(() => dispatch(getUser(userId)), timeout, immediate);
  }

  navigateBack () {
    const { history } = this.props;
    history.push('/users');
  }

  delete () {
    const { userId } = this.props.match.params;
    const user = this.props.users.map[userId].data;
    if (!user.published) {
      this.props.dispatch(deleteUser(userId));
    }
  }

  errors () {
    const userId = this.props.match.params.userId;
    return [
      get(this.props.users.map, [userId, 'error']),
      get(this.props.users.deleted, [userId, 'error'])
    ].filter(Boolean);
  }

  render () {
    const userId = this.props.match.params.userId;
    const record = this.props.users.map[userId];

    if (!record || (record.inflight && !record.data)) {
      return <Loading />;
    } else if (record.error) {
      return <ErrorReport report={record.error} truncate={true} />;
    }
    const user = record.data;
    const errors = this.errors();

    const deleteStatus = get(this.props.users.deleted, [userId, 'status']);
    const dropdownConfig = [{
      text: 'Delete',
      action: this.delete,
      disabled: user.published,
      status: deleteStatus,
      success: this.navigateBack,
      confirmAction: true,
      confirmText: deleteText(userId)
    }];

    return (
      <div className='page__component'>
        <section className='page__section page__section__header-wrapper'>
          <h1 className='heading--large heading--shared-content with-description'>{userId}</h1>
          <AsyncCommands config={dropdownConfig} />
          <Link
            className='button button--small button--green button--edit form-group__element--right'
            to={'/users/edit/' + userId}>Edit</Link>

          {lastUpdated(user.updatedAt)}
        </section>

        <section className='page__section'>
          {errors.length ? <ErrorReport report={errors} truncate={true} /> : null}
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium with-description'>User Overview</h2>
          </div>
          <Metadata data={user} accessors={metaAccessors} />
        </section>

        <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>Groups</h2>
          </div>
          <Table
            data={user.groups}
            tableColumns={groupTableColumns}
          />
        </section>

        <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>Permissions</h2>
          </div>
          <Table
            data={user.permissions}
            tableColumns={permissionTableColumns}
          />
        </section>

        <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>Subscriptions</h2>
          </div>
          <Table
            data={user.subscriptions}
            tableColumns={subscriptionTableColumns}
          />
        </section>
      </div>
    );
  }
}

UserOverview.propTypes = {
  match: PropTypes.object,
  dispatch: PropTypes.func,
  users: PropTypes.object,
  logs: PropTypes.object,
  history: PropTypes.object
};

UserOverview.displayName = 'UserElem';

export default withRouter(connect(state => ({
  users: state.users,
  logs: state.logs
}))(UserOverview));
