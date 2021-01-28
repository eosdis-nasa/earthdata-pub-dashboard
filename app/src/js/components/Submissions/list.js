'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  searchSubmissions,
  clearSubmissionsSearch,
  filterSubmissions,
  clearSubmissionsFilter,
  listSubmissions,
  getOptionsSubmissionName,
  listWorkflows,
  applyWorkflowToSubmission,
  interval
} from '../../actions';
import { get } from 'object-path';
import { lastUpdated, tally, displayCase } from '../../utils/format';
import {
  tableColumns,
  errorTableColumns,
  bulkActions,
  simpleDropdownOption
} from '../../utils/table-config/submissions';
import List from '../Table/Table';
import LogViewer from '../Logs/viewer';
import Dropdown from '../DropDown/dropdown';
import Search from '../Search/search';
import statusOptions from '../../utils/status';
import { strings } from '../locale';
import _config from '../../config';
import { workflowOptionNames } from '../../selectors';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import ListFilters from '../ListActions/ListFilters';
import pageSizeOptions from '../../utils/page-size';

const { updateInterval } = _config;

class AllSubmissions extends React.Component {
  constructor () {
    super();
    this.displayName = strings.all_submissions;
    this.queryWorkflows = this.queryWorkflows.bind(this);
    this.generateQuery = this.generateQuery.bind(this);
    this.generateBulkActions = this.generateBulkActions.bind(this);
    this.selectWorkflow = this.selectWorkflow.bind(this);
    this.applyWorkflow = this.applyWorkflow.bind(this);
    this.getExecuteOptions = this.getExecuteOptions.bind(this);
    this.getView = this.getView.bind(this);
    this.state = {};
  }

  componentDidMount () {
    this.cancelInterval = interval(this.queryWorkflows, updateInterval, true);
  }

  componentWillUnmount () {
    if (this.cancelInterval) { this.cancelInterval(); }
  }

  queryWorkflows () {
    this.props.dispatch(listWorkflows());
  }

  generateQuery () {
    const options = {};
    const view = this.getView();
    if (view && view !== 'all') options.status = view;
    options.status = view;
    this.props.onQueryChange(options);
    return options;
  }

  generateBulkActions () {
    const config = {
      execute: {
        options: this.getExecuteOptions(),
        action: this.applyWorkflow
      }
    };
    const { submissions } = this.props;
    return bulkActions(submissions, config);
  }

  selectWorkflow (selector, workflow) {
    this.setState({ workflow });
  }

  applyWorkflow (submissionId) {
    return applyWorkflowToSubmission(submissionId, this.state.workflow);
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

  getView () {
    const { pathname } = this.props.location;
    if (pathname === '/submissions/completed') return 'completed';
    else if (pathname === '/submissions/processing') return 'running';
    else if (pathname === '/submissions/failed') return 'failed';
    else return 'all';
  }

  render () {
    const { submissions, dispatch, logs } = this.props;
    console.log('SUBMISSIONSSSSSSSSSSSSSSSSS', this.props);
    const { list, dropdowns } = submissions;
    const { count, queriedAt } = list.meta;
    const logsQuery = { submissionId__exists: 'true' };
    const query = this.generateQuery();
    const view = this.getView();
    const displayCaseView = displayCase(view);
    const statusOpts = (view === 'all') ? statusOptions : null;
    const tableSortIdx = view === 'failed' ? 'submissionId' : 'timestamp';
    const breadcrumbConfig = [
      {
        label: 'Dashboard Home',
        href: '/'
      },
      {
        label: 'Submissions',
        href: '/submissions'
      },
      {
        label: displayCaseView,
        active: true
      }
    ];
    return (
      <div className='page__component'>
        <section className='page__section'>
          <section className='page__section page__section__controls'>
            <Breadcrumbs config={breadcrumbConfig} />
          </section>
          <div className='page__section__header page__section__header-wrapper'>
            <h1 className='heading--large heading--shared-content with-description '>
              {displayCaseView} {strings.all_submissions} <span className='num--title'>{ !isNaN(count) ? `${tally(count)}` : 0 }</span>
            </h1>
            {lastUpdated(queriedAt)}
          </div>
        </section>
        <section className='page__section'>
          <List
            list={list}
            action={listSubmissions}
            tableColumns={view === 'failed' ? errorTableColumns : tableColumns}
            query={query}
            bulkActions={this.generateBulkActions()}
            rowId='submissionId'
            sortIdx={tableSortIdx}
          >
            <ListFilters>
              <Dropdown
                getOptions={getOptionsSubmissionName}
                options={get(dropdowns, ['name', 'options'])}
                action={filterSubmissions}
                clear={clearSubmissionsFilter}
                param='name'
                label='Submission'
                inputProps={{
                  placeholder: 'All'
                }}
              />
              {statusOpts &&
                <Dropdown
                  options={statusOpts}
                  action={filterSubmissions}
                  clear={clearSubmissionsFilter}
                  paramKey='status'
                  label='Status'
                  inputProps={{
                    placeholder: 'All'
                  }}
                />
              }
              <Search
                dispatch={dispatch}
                action={searchSubmissions}
                clear={clearSubmissionsSearch}
                label='Search'
                inputProps={{
                  placeholder: 'Search'
                }}
              />
              <Dropdown
                options={pageSizeOptions}
                action={filterSubmissions}
                clear={clearSubmissionsFilter}
                paramKey='limit'
                label='Results Per Page'
                inputProps={{
                  placeholder: 'Results Per Page'
                }}
              />
            </ListFilters>
          </List>
        </section>
        <LogViewer
          query={logsQuery}
          dispatch={dispatch}
          logs={logs}
          notFound='No recent logs for submissions'
        />
      </div>
    );
  }
}

AllSubmissions.propTypes = {
  submissions: PropTypes.object,
  logs: PropTypes.object,
  dispatch: PropTypes.func,
  location: PropTypes.object,
  workflowOptions: PropTypes.array,
  onQueryChange: PropTypes.func
};

export { listSubmissions };

export default withRouter(connect(state => ({
  logs: state.logs,
  submissions: state.submissions,
  workflowOptions: workflowOptionNames(state)
}))(AllSubmissions));
