'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { get } from 'object-path';
import {
  listUsers,
  // getCount,
  // filterUsers,
  // clearUsersFilter
} from '../../actions';
import { lastUpdated, tally, displayCase } from '../../utils/format';
import { tableColumns } from '../../utils/table-config/users';
import List from '../Table/Table';
import PropTypes from 'prop-types';
import Overview from '../Overview/overview';
import { strings } from '../locale';
// import _config from '../../config';
// import Dropdown from '../DropDown/dropdown';
// import pageSizeOptions from '../../utils/page-size';
// import ListFilters from '../ListActions/ListFilters';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
// import pageSizeOptions from '../../utils/page-size';

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

class UsersOverview extends React.Component {
  constructor () {
    super();
    this.generateQuery = this.generateQuery.bind(this);
    this.renderOverview = this.renderOverview.bind(this);
    this.queryMeta = this.queryMeta.bind(this);
    this.state = {};
  }

  componentDidMount () {
    const { dispatch } = this.props;
    dispatch(listUsers);
  }

  componentWillUnmount () {
  }

  queryMeta () {
    // const { dispatch } = this.props;
    /* dispatch(getCount({
      type: 'users'
    })); */
  }

  generateQuery () {
    return {};
  }

  renderOverview (count) {
    const overview = count.map(d => [tally(d.count), displayCase(d.key)]);
    return <Overview items={overview} inflight={false} />;
  }

  render () {
    const { dispatch } = this.props;
    dispatch(listUsers);
    const { list } = this.props.users;
    console.log('USERSSSSSSSSSSS FROM OVERVIEW', this.props);
    const { stats } = this.props;
    const { queriedAt } = list.meta;
    const statsCount = get(stats, 'count.data.users.count', []);
    const overviewItems = statsCount.map(d => [tally(d.count), displayCase(d.key)]);
    return (
      <div className='page__component'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <section className='page__section page__section__header-wrapper'>
          <div className='page__section__header'>
            <h1 className='heading--large heading--shared-content with-description '>{strings.user_overview}</h1>
            {lastUpdated(queriedAt)}
            <Overview items={overviewItems} inflight={false} />
          </div>
        </section>
        <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>{strings.all_users} <span className='num--title'>{list.data.length}</span></h2>
          </div>
          <List
            list={list}
            dispatch={this.props.dispatch}
            action={listUsers}
            tableColumns={tableColumns}
            query={this.generateQuery()}
            rowId='long_name'
            sortIdx='last_login'
          >
            {/* <ListFilters>
              <Dropdown
                options={pageSizeOptions}
                action={filterUsers}
                clear={clearUsersFilter}
                paramKey={'limit'}
                label={'Limit Results'}
                inputProps={{
                  placeholder: 'Results Per Page'
                }}
              />
            </ListFilters> */}
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
