'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { get } from 'object-path';
import cloneDeep from 'lodash.clonedeep';
import {
  listUsers,
  getCount,
  interval,
  filterUsers,
  clearUsersFilter
} from '../../actions';
import { lastUpdated, tally, displayCase } from '../../utils/format';
import { tableColumns } from '../../utils/table-config/users';
import List from '../Table/Table';
import PropTypes from 'prop-types';
import Overview from '../Overview/overview';
import _config from '../../config';
import Dropdown from '../DropDown/dropdown';
import pageSizeOptions from '../../utils/page-size';
import ListFilters from '../ListActions/ListFilters';

const { updateInterval } = _config;

class UsersOverview extends React.Component {
  constructor () {
    super();
    this.queryStats = this.queryStats.bind(this);
    this.generateQuery = this.generateQuery.bind(this);
    this.renderOverview = this.renderOverview.bind(this);
  }

  componentDidMount () {
    this.cancelInterval = interval(this.queryStats, updateInterval, true);
  }

  componentWillUnmount () {
    if (this.cancelInterval) { this.cancelInterval(); }
  }

  queryStats () {
    this.props.dispatch(getCount({
      type: 'collections',
      field: 'users'
    }));
    this.props.dispatch(getCount({
      type: 'users',
      field: 'status'
    }));
  }

  generateQuery () {
    return {};
  }

  renderOverview (count) {
    const overview = count.map(d => [tally(d.count), displayCase(d.key)]);
    return <Overview items={overview} inflight={false} />;
  }

  render () {
    const { list } = this.props.users;
    const { stats } = this.props;
    const { count, queriedAt } = list.meta;

    // Incorporate the collection counts into the `list`
    const mutableList = cloneDeep(list);
    const collectionCounts = get(stats.count, 'data.collections.count', []);

    mutableList.data.forEach(d => {
      d.collections = get(collectionCounts.find(c => c.key === d.name), 'count', 0);
    });
    const userStatus = get(stats.count, 'data.users.count', []);
    const overview = this.renderOverview(userStatus);
    return (
      <div className='page__component'>
        <section className='page__section page__section__header-wrapper'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content'>Users <span className='num--title'>{count ? `${count}` : 0}</span></h2>
          </div>
          <div className='filter__button--add'>
            <Link className='button button--green button--add button--small form-group__element' to='/users/add'>Add User</Link>
          </div>
          <List
            list={mutableList}
            dispatch={this.props.dispatch}
            action={listUsers}
            tableColumns={tableColumns}
            query={this.generateQuery()}
            bulkActions={[]}
            rowId='name'
            sortIdx='timestamp'
          >
            <ListFilters>
              <Dropdown
                options={pageSizeOptions}
                action={filterUsers}
                clear={clearUsersFilter}
                paramKey={'limit'}
                label={'Results Per Page'}
                inputProps={{
                  placeholder: 'Results Per Page'
                }}
              />
            </ListFilters>
          </List>
        </section>
      </div>
    );
  }
}

UsersOverview.propTypes = {
  dispatch: PropTypes.func,
  users: PropTypes.object,
  stats: PropTypes.object
};

export default withRouter(connect(state => state)(UsersOverview));
