'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  // getCount,
  // searchRequests,
  // clearRequestsSearch,
  // filterRequests,
  // clearRequestsFilter,
  listRequests
  // filterStages,
  // filterStatuses,
  // clearStagesFilter,
  // clearStatusesFilter,
  // listWorkflows,
  // getOptionsRequestName,
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
import Loading from '../LoadingIndicator/loading-indicator';
import Meditor from '../MeditorModal/modal';

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
    label: strings.requests_inprogress2,
    href: '/requests',
    active: true
  }
];

class RequestsOverview extends React.Component {
  constructor () {
    super();
    this.state = {};
    this.generateQuery = this.generateQuery.bind(this);
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
        if (!record[r].hidden && record[r].step_name !== 'close' && typeof record[r] === 'object') {
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
    const initiateRequestSelectDaac = `${_config.formsUrl}${_config.initiateRequestSelectDaac}`;
    const { canInitialize } = requestPrivileges(this.props.privileges);
    const query = this.generateQuery();
    const { queriedAt } = list.meta;
    list = this.filter(list);
    const unique = [...new Set(list.data.map(item => item.id))];
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
          <h2 className='heading--medium heading--shared-content with-description'>{strings.all_requests} <span className='num--title'>{unique.length}</span></h2>
          { canInitialize ? <a className='button button--small button--green button--add form-group__element--right' href={initiateRequestSelectDaac} aria-label="Create new request">New Request</a> : null }
        </div>
        {!list
          ? <Loading />
          : <List
          list={list}
          tableColumns={tableColumns}
          query={query}
          rowId='id'
          filterIdx='name'
          filterPlaceholder='Search Requests'
        >
        </List>
        }
      </section>
      <Meditor></Meditor>
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
  requestCSV: PropTypes.object,
  privileges: PropTypes.object,
  roles: PropTypes.array
};

export { RequestsOverview };

export default withRouter(connect(state => ({
  stats: state.stats,
  workflowOptions: workflowOptionNames(state),
  requests: state.requests,
  config: state.config,
  requestCSV: state.requestCSV,
  privileges: state.api.tokens.privileges,
  roles: state.api.tokens.roles
}))(RequestsOverview));
