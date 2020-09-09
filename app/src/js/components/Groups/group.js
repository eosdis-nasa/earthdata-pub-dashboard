'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import {
  interval,
  getGroup,
  deleteGroup
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
    label: 'Group Name',
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

class GroupOverview extends React.Component {
  constructor () {
    super();
    this.reload = this.reload.bind(this);
    this.navigateBack = this.navigateBack.bind(this);
    this.delete = this.delete.bind(this);
    this.errors = this.errors.bind(this);
  }

  componentDidMount () {
    const { groupId } = this.props.match.params;
    const immediate = !this.props.groups.map[groupId];
    this.reload(immediate);
    /* this.props.dispatch(listCollections({
      limit: 100,
      fields: 'collectionName',
      groups: groupId
    })); */
  }

  componentWillUnmount () {
    if (this.cancelInterval) { this.cancelInterval(); }
  }

  reload (immediate, timeout) {
    timeout = timeout || updateInterval;
    const groupId = this.props.match.params.groupId;
    const { dispatch } = this.props;
    if (this.cancelInterval) { this.cancelInterval(); }
    this.cancelInterval = interval(() => dispatch(getGroup(groupId)), timeout, immediate);
  }

  navigateBack () {
    const { history } = this.props;
    history.push('/groups');
  }

  delete () {
    const { groupId } = this.props.match.params;
    const group = this.props.groups.map[groupId].data;
    if (!group.published) {
      this.props.dispatch(deleteGroup(groupId));
    }
  }

  errors () {
    const groupId = this.props.match.params.groupId;
    return [
      get(this.props.groups.map, [groupId, 'error']),
      get(this.props.groups.deleted, [groupId, 'error'])
    ].filter(Boolean);
  }

  render () {
    const groupId = this.props.match.params.groupId;
    const record = this.props.groups.map[groupId];

    if (!record || (record.inflight && !record.data)) {
      return <Loading />;
    } else if (record.error) {
      return <ErrorReport report={record.error} truncate={true} />;
    }
    const group = record.data;

    const errors = this.errors();

    const deleteStatus = get(this.props.groups.deleted, [groupId, 'status']);
    const dropdownConfig = [{
      text: 'Delete',
      action: this.delete,
      disabled: group.published,
      status: deleteStatus,
      success: this.navigateBack,
      confirmAction: true,
      confirmText: deleteText(groupId)
    }];

    return (
      <div className='page__component'>
        <section className='page__section page__section__header-wrapper'>
          <h1 className='heading--large heading--shared-content with-description'>{groupId}</h1>
          <AsyncCommands config={dropdownConfig} />
          <Link
            className='button button--small button--green button--edit form-group__element--right'
            to={'/groups/edit/' + groupId}>Edit</Link>

          {lastUpdated(group.updatedAt)}
        </section>

        <section className='page__section'>
          {errors.length ? <ErrorReport report={errors} truncate={true} /> : null}
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium with-description'>Group Overview</h2>
          </div>
          <Metadata data={group} accessors={metaAccessors} />
        </section>

        <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>Permissions</h2>
          </div>
          <Table
            data={group.permissions}
            tableColumns={permissionTableColumns}
          />
        </section>

        <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>Subscriptions</h2>
          </div>
          <Table
            data={group.subscriptions}
            tableColumns={subscriptionTableColumns}
          />
        </section>
      </div>
    );
  }
}

GroupOverview.propTypes = {
  match: PropTypes.object,
  dispatch: PropTypes.func,
  groups: PropTypes.object,
  logs: PropTypes.object,
  history: PropTypes.object
};

GroupOverview.displayName = 'GroupElem';

export default withRouter(connect(state => ({
  groups: state.groups,
  logs: state.logs
}))(GroupOverview));
