'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import {
  interval,
  getRole,
  deleteRole
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
    label: 'Role Name',
    property: 'name'
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

class RoleOverview extends React.Component {
  constructor () {
    super();
    this.reload = this.reload.bind(this);
    this.navigateBack = this.navigateBack.bind(this);
    this.delete = this.delete.bind(this);
    this.errors = this.errors.bind(this);
  }

  componentDidMount () {
    const { roleId } = this.props.match.params;
    const immediate = !this.props.roles.map[roleId];
    this.reload(immediate);
    /* this.props.dispatch(listCollections({
      limit: 100,
      fields: 'collectionName',
      roles: roleId
    })); */
  }

  componentWillUnmount () {
    if (this.cancelInterval) { this.cancelInterval(); }
  }

  reload (immediate, timeout) {
    timeout = timeout || updateInterval;
    const roleId = this.props.match.params.roleId;
    const { dispatch } = this.props;
    if (this.cancelInterval) { this.cancelInterval(); }
    this.cancelInterval = interval(() => dispatch(getRole(roleId)), timeout, immediate);
  }

  navigateBack () {
    const { history } = this.props;
    history.push('/roles');
  }

  delete () {
    const { roleId } = this.props.match.params;
    const role = this.props.roles.map[roleId].data;
    if (!role.published) {
      this.props.dispatch(deleteRole(roleId));
    }
  }

  errors () {
    const roleId = this.props.match.params.roleId;
    return [
      get(this.props.roles.map, [roleId, 'error']),
      get(this.props.roles.deleted, [roleId, 'error'])
    ].filter(Boolean);
  }

  render () {
    const roleId = this.props.match.params.roleId;
    const record = this.props.roles.map[roleId];

    if (!record || (record.inflight && !record.data)) {
      return <Loading />;
    } else if (record.error) {
      return <ErrorReport report={record.error} truncate={true} />;
    }
    const role = record.data;

    const errors = this.errors();

    const deleteStatus = get(this.props.roles.deleted, [roleId, 'status']);
    const dropdownConfig = [{
      text: 'Delete',
      action: this.delete,
      disabled: role.published,
      status: deleteStatus,
      success: this.navigateBack,
      confirmAction: true,
      confirmText: deleteText(roleId)
    }];

    return (
      <div className='page__component'>
        <section className='page__section page__section__header-wrapper'>
          <h1 className='heading--large heading--shared-content with-description'>{roleId}</h1>
          <AsyncCommands config={dropdownConfig} />
          <Link
            className='button button--small button--green button--edit form-role__element--right'
            to={'/roles/edit/' + roleId}>Edit</Link>

          {lastUpdated(role.updatedAt)}
        </section>

        <section className='page__section'>
          {errors.length ? <ErrorReport report={errors} truncate={true} /> : null}
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium with-description'>Role Overview</h2>
          </div>
          <Metadata data={role} accessors={metaAccessors} />
        </section>

        <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>Permissions</h2>
          </div>
          <Table
            data={role.permissions}
            tableColumns={permissionTableColumns}
          />
        </section>

        <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>Subscriptions</h2>
          </div>
          <Table
            data={role.subscriptions}
            tableColumns={subscriptionTableColumns}
          />
        </section>
      </div>
    );
  }
}

RoleOverview.propTypes = {
  match: PropTypes.object,
  dispatch: PropTypes.func,
  roles: PropTypes.object,
  logs: PropTypes.object,
  history: PropTypes.object
};

RoleOverview.displayName = 'RoleElem';

export default withRouter(connect(state => ({
  roles: state.roles,
  logs: state.logs
}))(RoleOverview));
