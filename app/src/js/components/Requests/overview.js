'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  // getCount,
  // searchSubmissions,
  // clearSubmissionsSearch,
  // filterSubmissions,
  // clearSubmissionsFilter,
  listRequests
  // filterStages,
  // filterStatuses,
  // clearStagesFilter,
  // clearStatusesFilter,
  // listWorkflows,
  // getOptionsSubmissionName
} from '../../actions';
// import { get } from 'object-path';
import {
  lastUpdated,
  // tally,
  // displayCase
} from '../../utils/format';
import {
  tableColumns
} from '../../utils/table-config/requests';
import List from '../Table/Table';
// import Dropdown from '../DropDown/dropdown';
// import Search from '../Search/search';
// import Overview from '../Overview/overview';
// import statusOptions from '../../utils/status';
// import stageOptions from '../../utils/stage';
import _config from '../../config';
import { strings } from '../locale';
import { workflowOptionNames } from '../../selectors';
// import { window } from '../../utils/browser';
// import ListFilters from '../ListActions/ListFilters';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
// import pageSizeOptions from '../../utils/page-size';
import { requestPrivileges } from '../../utils/privileges';

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
    label: strings.submissions_inprogress2,
    href: '/requests',
    active: true
  }
];

class RequestsOverview extends React.Component {
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

  render () {
    const {
      // stats,
      requests
    } = this.props;
    const {
      list,
      // dropdowns
    } = requests;
    const unique = [...new Set(list.data.map(item => item.id))];
    const { queriedAt } = list.meta;
    const initiateRequestSelectDaac = `${_config.formsUrl}${_config.initiateRequestSelectDaac}`;
    const { canInitialize } = requestPrivileges(this.props.privileges);
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
            <h2 className='heading--medium heading--shared-content with-description'>{strings.all_submissions} <span className='num--title'>{unique.length}</span></h2>
            { canInitialize ? <a className='button button--small button--green button--add form-group__element--right' href={initiateRequestSelectDaac}>New Request</a> : null }
          </div>
          <List
            list={list}
            action={listRequests}
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

RequestsOverview.propTypes = {
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

export { RequestsOverview };

export default withRouter(connect(state => ({
  stats: state.stats,
  workflowOptions: workflowOptionNames(state),
  requests: state.requests,
  config: state.config,
  submissionCSV: state.submissionCSV,
  privileges: state.api.tokens.privileges,
  roles: state.api.tokens.roles,
}))(RequestsOverview));
