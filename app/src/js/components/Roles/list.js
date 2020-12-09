'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  searchRoles,
  clearRolesSearch,
  filterRoles,
  clearRolesFilter,
  listRoles,
  getOptionsCollectionName,
  listWorkflows,
  applyWorkflowToRole,
  interval
} from '../../actions';
import { get } from 'object-path';
import { lastUpdated, tally, displayCase } from '../../utils/format';
import {
  tableColumns,
  errorTableColumns,
  bulkActions,
  simpleDropdownOption
} from '../../utils/table-config/roles';
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

class AllRoles extends React.Component {
  constructor () {
    super();
    this.displayName = strings.all_roles;
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
    const { roles } = this.props;
    return bulkActions(roles, config);
  }

  selectWorkflow (selector, workflow) {
    this.setState({ workflow });
  }

  applyWorkflow (roleId) {
    return applyWorkflowToRole(roleId, this.state.workflow);
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
    if (pathname === '/roles/completed') return 'completed';
    else if (pathname === '/roles/processing') return 'running';
    else if (pathname === '/roles/failed') return 'failed';
    else return 'all';
  }

  render () {
    const { roles, dispatch, logs } = this.props;
    const { list, dropdowns } = roles;
    const { count, queriedAt } = list.meta;
    const logsQuery = { roleId__exists: 'true' };
    const query = this.generateQuery();
    const view = this.getView();
    const displayCaseView = displayCase(view);
    const statusOpts = (view === 'all') ? statusOptions : null;
    const tableSortIdx = view === 'failed' ? 'roleId' : 'timestamp';
    const breadcrumbConfig = [
      {
        label: 'Dashboard Home',
        href: '/'
      },
      {
        label: 'Roles',
        href: '/roles'
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
              {displayCaseView} {strings.roles} <span className='num--title'>{ !isNaN(count) ? `${tally(count)}` : 0 }</span>
            </h1>
            {lastUpdated(queriedAt)}
          </div>
        </section>
        <section className='page__section'>
          <List
            list={list}
            action={listRoles}
            tableColumns={view === 'failed' ? errorTableColumns : tableColumns}
            query={query}
            bulkActions={this.generateBulkActions()}
            rowId='roleId'
            sortIdx={tableSortIdx}
          >
            <ListFilters>
              <Dropdown
                getOptions={getOptionsCollectionName}
                options={get(dropdowns, ['collectionName', 'options'])}
                action={filterRoles}
                clear={clearRolesFilter}
                paramKey='collectionId'
                label='Collection'
                inputProps={{
                  placeholder: 'All'
                }}
              />
              {statusOpts &&
                <Dropdown
                  options={statusOpts}
                  action={filterRoles}
                  clear={clearRolesFilter}
                  paramKey='status'
                  label='Status'
                  inputProps={{
                    placeholder: 'All'
                  }}
                />
              }
              <Search
                dispatch={dispatch}
                action={searchRoles}
                clear={clearRolesSearch}
                label='Search'
                placeholder='Role ID'
              />
              <Dropdown
                options={pageSizeOptions}
                action={filterRoles}
                clear={clearRolesFilter}
                paramKey='limit'
                label='Results Per Page'
                inputProps={{
                  placeholder: 'Results Per Page',
                }}
              />
            </ListFilters>
          </List>
        </section>
        <LogViewer
          query={logsQuery}
          dispatch={dispatch}
          logs={logs}
          notFound='No recent logs for roles'
        />
      </div>
    );
  }
}

AllRoles.propTypes = {
  roles: PropTypes.object,
  logs: PropTypes.object,
  dispatch: PropTypes.func,
  location: PropTypes.object,
  workflowOptions: PropTypes.array,
  onQueryChange: PropTypes.func
};

export { listRoles };

export default withRouter(connect(state => ({
  logs: state.logs,
  roles: state.roles,
  workflowOptions: workflowOptionNames(state)
}))(AllRoles));
