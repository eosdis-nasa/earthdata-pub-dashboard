'use strict';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import {
  // getCount,
  // searchWorkflows,
  // clearWorkflowsSearch,
  // filterWorkflows,
  // clearWorkflowsFilter,
  listWorkflows
} from '../../actions';
import { lastUpdated } from '../../utils/format';
import { tableColumns } from '../../utils/table-config/workflows';
import List from '../Table/Table';
// import Overview from '../Overview/overview';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

const breadcrumbConfig = [
  {
    label: 'Dashboard Home',
    href: '/'
  },
  {
    label: 'Workflows',
    active: true
  }
];

const WorkflowsOverview = ({ workflows }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(listWorkflows());
  }, [workflows.searchString, dispatch]);
  const { queriedAt } = workflows.list.meta;
  return (
    <div className='page__component'>
      <section className='page__section page__section__controls'>
        <Breadcrumbs config={breadcrumbConfig} />
      </section>
      <section className='page__section page__section__header-wrapper'>
        <div className='page__section__header'>
          <h1 className='heading--large heading--shared-content with-description '>{strings.workflow_overview}</h1>
          {lastUpdated(queriedAt)}
        </div>
      </section>
      <section className='page__section'>
        <div className='heading__wrapper--border'>
          <h2 className='heading--medium heading--shared-content with-description'>{strings.all_workflows} <span className='num--title'>{workflows.list.data.length}</span></h2>
        </div>
        {/* Someone needs to define the search parameters for workflows, e.g. steps, collections, granules, etc. } */}
        <List
          list={workflows.list}
          dispatch={dispatch}
          action={listWorkflows}
          tableColumns={tableColumns}
          query={{}}
          bulkActions={[]}
          rowId='id'
          sortIdx='long_name'
        >
          {/* <ListFilters>
            <Search
              dispatch={dispatch}
              action={searchWorkflows}
              clear={clearWorkflowsSearch}
              label='Search'
              placeholder="Workflow Name"
            />
          </ListFilters> */}
        </List>
      </section>
    </div>
  );
};

WorkflowsOverview.propTypes = {
  workflows: PropTypes.object,
  stats: PropTypes.object,
  dispatch: PropTypes.func,
  config: PropTypes.object
};

export { WorkflowsOverview };

export default withRouter(connect(state => ({
  stats: state.stats,
  workflows: state.workflows,
  config: state.config
}))(WorkflowsOverview));
