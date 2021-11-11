'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  interval,
  // getCount,
  // searchSubmissions,
  // clearSubmissionsSearch,
  // filterSubmissions,
  // clearSubmissionsFilter,
  listRequests,
  // filterStages,
  // filterStatuses,
  // clearStagesFilter,
  // clearStatusesFilter,
  // listWorkflows,
  applyWorkflowToRequest,
  // getOptionsSubmissionName
} from '../../actions';
// import { get } from 'object-path';
import {
  lastUpdated,
  // tally,
  // displayCase
} from '../../utils/format';
import {
  tableColumns,
  simpleDropdownOption,
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

const { updateInterval } = _config;

const breadcrumbConfig = [
  {
    label: 'Dashboard Home',
    href: '/'
  },
  {
    label: 'Requests',
    active: true
  }
];

class RequestsOverview extends React.Component {
  constructor () {
    super();
    this.generateQuery = this.generateQuery.bind(this);
    this.queryMeta = this.queryMeta.bind(this);
    this.selectWorkflow = this.selectWorkflow.bind(this);
    this.applyWorkflow = this.applyWorkflow.bind(this);
    this.getExecuteOptions = this.getExecuteOptions.bind(this);
    this.state = {};
  }

  componentDidMount () {
    this.cancelInterval = interval(this.queryMeta, updateInterval, true);
    const { dispatch } = this.props;
    dispatch(listRequests());
  }

  componentWillUnmount () {
    if (this.cancelInterval) { this.cancelInterval(); }
  }

  queryMeta () {
    // const { dispatch } = this.props;
    // dispatch(listWorkflows());
    /* dispatch(getCount({
      type: 'requests'
    })); */
  }

  generateQuery () {
    return {};
  }

  /* generateBulkActions () {
    const actionConfig = {
      execute: {
        options: this.getExecuteOptions(),
        action: this.applyWorkflow
      },
      recover: {
        options: this.getExecuteOptions(),
        action: this.applyRecoveryWorkflow
      }
    };
    const { requests, config } = this.props;
    let actions = bulkActions(requests, actionConfig);
    if (config.enableRecovery) {
      actions = actions.concat(recoverAction(requests, actionConfig));
    }
    return actions;
  } */

  selectWorkflow (selector, workflow) {
    this.setState({ workflow });
  }

  applyWorkflow (requestId) {
    return applyWorkflowToRequest(requestId, this.state.workflow);
  }

  onlyUnique (value, index, self) {
    return self.indexOf(value) === index;
  }

  getExecuteOptions () {
    return [
      simpleDropdownOption({
        handler: this.selectWorkflow,
        label: 'workflow',
        value: this.state.workflow,
        options: this.props.workflowOptions
      })
    ];
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
    // const statsCount = get(stats, 'count.data.requests.count', []);
    // const overviewItems = statsCount.map(d => [tally(d.count), displayCase(d.key)]);
    return (
      <div className='page__component'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <section className='page__section page__section__header-wrapper'>
          <div className='page__section__header'>
            <h1 className='heading--large heading--shared-content with-description '>{strings.submission_overview}</h1>
            {lastUpdated(queriedAt)}
            {/* <Overview items={overviewItems} inflight={false} /> */}
          </div>
        </section>
        <section className='page__section page__section__controls'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>{strings.all_submissions} <span className='num--title'>{unique.length}</span></h2>
            <a className='button button--small button--green button--add form-group__element--right' href={initiateRequestSelectDaac}>New Request</a>
          </div>
          <List
            list={list}
            action={listRequests}
            tableColumns={tableColumns}
            query={this.generateQuery()}
            rowId='id'
            sortIdx='created_at'
          >
            {/* <ListFilters>
              <Dropdown
                getOptions={getOptionsSubmissionName}
                options={get(dropdowns, ['name', 'options'])}
                action={filterSubmissions}
                clear={clearSubmissionsFilter}
                paramKey='requestId'
                label={strings.request}
                inputProps={{
                  placeholder: 'All',
                }}
              />
              <Dropdown
                options={stageOptions}
                action={filterStages}
                clear={clearStagesFilter}
                paramKey='stage'
                label='Stage'
                inputProps={{
                  placeholder: 'All',
                }}
              />
              <Dropdown
                options={statusOptions}
                action={filterStatuses}
                clear={clearStatusesFilter}
                paramKey='status'
                label='Status'
                inputProps={{
                  placeholder: 'All',
                }}
              />
              <Search
                dispatch={dispatch}
                action={searchSubmissions}
                clear={clearSubmissionsSearch}
                label='Search'
                placeholder='Search'
                title='Search'
              />
              <Dropdown
                options={pageSizeOptions}
                action={filterSubmissions}
                clear={clearSubmissionsFilter}
                paramKey='limit'
                label='Limit Results'
                inputProps={{
                  placeholder: 'Results Per Page',
                }}
              />
            </ListFilters> */}

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
  submissionCSV: PropTypes.object
};

export { RequestsOverview };

export default withRouter(connect(state => ({
  stats: state.stats,
  workflowOptions: workflowOptionNames(state),
  requests: state.requests,
  config: state.config,
  submissionCSV: state.submissionCSV
}))(RequestsOverview));
