'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  listRequests
} from '../../actions';
import {
  lastUpdated,
  shortDateNoTimeYearFirst,
  bool
} from '../../utils/format';
import List from '../Table/Table';
import { strings } from '../locale';
import { workflowOptionNames } from '../../selectors';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

const breadcrumbConfig = [
  {
    label: 'Dashboard Home',
    href: '/'
  },
  {
    label: 'Requests',
    href: '/requests'
  },
  {
    label: strings.submissions_withdrawn2,
    href: '/requests/withdrawn',
    active: true
  }
];

export const tableColumns = [
  {
    Header: 'Data Product Name',
    accessor: row => row.form_data ? row.form_data.data_product_name_value || '(no name)' : '(no name)',
    Cell: row => row.row ? <Link to={{ pathname: `/requests/id/${row.row.original.id}` }}>{row.row.original.form_data ? row.row.original.form_data.data_product_name_value || '(no name)' : '(no name)'}</Link> : '(no name)',
    id: 'name',
    width: 170
  },
  {
    Header: 'Status',
    accessor: (row) => row.status,
    Cell: row => row.row ? <Link to={{ pathname: `/requests/id/${row.row.original.id}` }}>{row.row.original.status}</Link> : null,
    id: 'status_message',
    width: 170
  },
  {
    Header: 'Workflow',
    accessor: (row) => row.workflow_name,
    Cell: row => row.row.original.workflow_name,
    id: 'workflow_name',
    width: 170
  },
  {
    Header: 'Created',
    accessor: row => shortDateNoTimeYearFirst(row.created_at),
    id: 'created_at',
    width: 110
  },
  {
    Header: 'Latest Edit',
    accessor: row => shortDateNoTimeYearFirst(row.last_change),
    id: 'last_change',
    width: 110
  },
  {
    Header: 'Locked',
    accessor: row => bool(row.lock),
    id: 'lock',
    width: 100
  },
  {
    Header: 'Conversation',
    accessor: (row) => row.conversation_id ? <Link to={{ pathname: `/conversations/id/${row.conversation_id}` }}>View</Link> : null,
    id: 'conversation_id',
    width: 120
  },
];

class InactiveRequestsOverview extends React.Component {
  constructor () {
    super();
    this.generateQuery = this.generateQuery.bind(this);
    this.state = {};
  }

  componentDidMount () {
    const { dispatch } = this.props;
    dispatch(listRequests());
  }

  generateQuery () {
    return {};
  }

  filter (list) {
    const newList = {};
    const tmp = [];
    for (const ea in list) {
      const record = list[ea];
      newList[ea] = record;
      for (const r in record) {
        if (record[r].hidden && typeof record[r] === 'object') {
          tmp.push(record[r]);
        }
      }
    }
    Object.defineProperty(newList, 'data', {
      value: tmp,
      writable: true,
      enumerable: true,
      configurable: true
    });
    return newList;
  }

  render () {
    const {
      // stats,
      requests
    } = this.props;
    let {
      list,
      // dropdowns
    } = requests;
    const { queriedAt } = list.meta;
    const isManager = this.props.roles.find(o => o.short_name.match(/manager/g));
    const isAdmin = this.props.privileges.ADMIN;
    if (typeof isManager !== 'undefined' || typeof isAdmin !== 'undefined') {
      const el = document.getElementsByName('assignButton');
      setTimeout(() => {
        for (const i in el) {
          if (typeof el[i].classList !== 'undefined') {
            el[i].classList.remove('button--disabled');
          }
        }
      }, 1);
    }
    list = this.filter(list);
    const unique = [...new Set(list.data.map(item => item.id))];
    // const statsCount = get(stats, 'count.data.requests.count', []);
    // const overviewItems = statsCount.map(d => [tally(d.count), displayCase(d.key)]);
    return (
      <div className='page__component'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <section className='page__section page__section__header-wrapper'>
          <div className='page__section__header'>
            <h1 className='heading--large heading--shared-content with-description '>{strings.requests}</h1>
            {lastUpdated(queriedAt)}
            {/* <Overview items={overviewItems} inflight={false} /> */}
          </div>
        </section>
        <section className='page__section page__section__controls'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>{strings.submissions_withdrawn2} Requests <span className='num--title'>{unique.length}</span></h2>
          </div>
          <List
            list={list}
            tableColumns={tableColumns}
            query={this.generateQuery()}
            rowId='id'
            filterIdx='name'
            filterPlaceholder='Search Requests'
          >
          </List>
        </section>
      </div>
    );
  }
}

InactiveRequestsOverview.propTypes = {
  requests: PropTypes.object,
  stats: PropTypes.object,
  dispatch: PropTypes.func,
  workflowOptions: PropTypes.array,
  location: PropTypes.object,
  config: PropTypes.object,
  submissionCSV: PropTypes.object,
  privileges: PropTypes.object,
  roles: PropTypes.array
};

export { InactiveRequestsOverview };

export default withRouter(connect(state => ({
  stats: state.stats,
  workflowOptions: workflowOptionNames(state),
  requests: state.requests,
  config: state.config,
  submissionCSV: state.submissionCSV,
  privileges: state.api.tokens.privileges,
  roles: state.api.tokens.roles,
}))(InactiveRequestsOverview));
