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
  bool,
  displayCase
} from '../../utils/format';
import {
  stepLookup
} from '../../utils/table-config/requests';
import List from '../Table/Table';
import { strings } from '../locale';
import { workflowOptionNames } from '../../selectors';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import Loading from '../LoadingIndicator/loading-indicator';

export const tableColumns = [
  {
    Header: 'Data Product Name',
    accessor: row => row.form_data ? row.form_data.data_product_name_value || 'Request Initialized' : 'Request Initialized',
    Cell: row => row.row ? <Link to={{ pathname: `/requests/id/${row.row.original.id}` }} aria-label="View your request details">{row.row.original.form_data ? row.row.original.form_data.data_product_name_value || 'Request Initialized' : 'Request Initialized'}</Link> : 'Request Initialized',
    id: 'name',
    width: 170
  },
  {
    Header: 'Status',
    accessor: (row) => row.status,
    Cell: row => row.row ? <Link to={{ pathname: `/requests/id/${row.row.original.id}` }} aria-label="View your request details">{row.row.original.status}</Link> : null,
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
    accessor: (row) => row.conversation_id ? <Link to={{ pathname: `/conversations/id/${row.conversation_id}` }} aria-label="View your conversations">View</Link> : null,
    id: 'conversation_id',
    width: 120
  },
  {
    Header: 'Next Action',
    accessor: row => stepLookup(row),
    id: 'next_action',
    width: 170
  }
];

class ActionRequestsOverview extends React.Component {
  constructor () {
    super();
    this.displayName = strings.all_requests;
    this.generateQuery = this.generateQuery.bind(this);
    this.getView = this.getView.bind(this);
    this.state = {};
  }

  getView () {
    const { pathname } = this.props.location;
    if (pathname === '/requests/status/action') return 'Processing Action';
    else if (pathname === '/requests/status/form') return 'Pending Form Submittal';
    else if (pathname === '/requests/status/review') return 'Pending Review';
    else if (pathname === '/requests/status/service') return 'Pending Service Completion';
    else if (pathname === '/requests/status/closed') return 'Closed';
    else if (pathname === '/requests/status/withdrawn') return 'Withdrawn';
    else return 'all';
  }

  componentDidMount () {
    const { dispatch } = this.props;
    dispatch(listRequests());
  }

  generateQuery (list) {
    const options = {};
    const view = this.getView();
    if (view && view !== 'all') options.status = view;
    options.status = view;
    return list;
  }

  filter (list) {
    const { pathname } = this.props.location;
    const newList = {};
    const tmp = [];
    for (const ea in list) {
      const record = list[ea];
      newList[ea] = record;
      for (const r in record) {
        // Once closing sets records to hidden once more, one can take out else statement.  status on close says ready now.
        if (pathname !== '/requests/status/closed') {
          if (typeof record[r] !== 'undefined' && record[r] !== null && !record[r].hidden && typeof record[r] === 'object' && record[r].status === this.getView()) {
            tmp.push(record[r]);
          }
        } else {
          if (typeof record[r] !== 'undefined' && record[r] !== null && typeof record[r] === 'object' && (record[r].hidden || record[r].step_name.match(/close/))) {
            tmp.push(record[r]);
          }
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
    const query = this.generateQuery(list);
    const view = this.getView();
    const displayCaseView = displayCase(view);
    const { queriedAt } = list.meta;
    list = this.filter(list);
    const unique = [...new Set(list.data.map(item => item.id))];
    // Review the headers
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
        label: displayCaseView,
        active: true
      }
    ];
    return (
      <div className='page__component'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <section className='page__section page__section__header-wrapper'>
          <div className='page__section__header'>
            {/* <h1 className='heading--large heading--shared-content with-description '>{strings.requests_actions}</h1> */}
            <h1 className='heading--large heading--shared-content with-description '>
              {displayCaseView}
            </h1>
            {lastUpdated(queriedAt)}
            {/* <Overview items={overviewItems} inflight={false} /> */}
          </div>
        </section>
        <section className='page__section page__section__controls'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>Action <span className='num--title'>{unique.length}</span></h2>
          </div>
          {!list
            ? <Loading />
            : <List
            list={this.filter(list)}
            tableColumns={tableColumns}
            query={query}
            rowId='id'
            filterIdx='name'
            filterPlaceholder='Search Requests'
          >
          </List>
          }
        </section>
      </div>
    );
  }
}

ActionRequestsOverview.propTypes = {
  requests: PropTypes.object,
  stats: PropTypes.object,
  dispatch: PropTypes.func,
  workflowOptions: PropTypes.array,
  location: PropTypes.object,
  config: PropTypes.object,
  requestCSV: PropTypes.object,
  privileges: PropTypes.object,
  roles: PropTypes.array,
  onQueryChange: PropTypes.func
};

export { ActionRequestsOverview };

export default withRouter(connect(state => ({
  stats: state.stats,
  workflowOptions: workflowOptionNames(state),
  requests: state.requests,
  config: state.config,
  requestCSV: state.requestCSV,
  privileges: state.api.tokens.privileges,
  roles: state.api.tokens.roles,
}))(ActionRequestsOverview));
