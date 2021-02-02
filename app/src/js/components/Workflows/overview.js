'use strict';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { lastUpdated, tally } from '../../utils/format';
import {
  listWorkflows,
  searchWorkflows,
  clearWorkflowsSearch
} from '../../actions';
import List from '../Table/Table';
import Search from '../Search/search';
import { tableColumns } from '../../utils/table-config/workflows';
import ListFilters from '../ListActions/ListFilters';

const WorkflowOverview = ({ workflows }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(listWorkflows());
  }, [workflows.searchString, dispatch]);
  const count = workflows.list.data.length;
  const { queriedAt } = workflows.list.meta;
  return (
    <div className='page__component'>
      <section className='page__section page__section__header-wrapper'>
        {lastUpdated(queriedAt)}
      </section>
      <section className='page__section'>
        <div className='heading__wrapper--border'>
          <h2 className='heading--medium heading--shared-content with-description'>All Workflows <span className='num--title'>{count ? ` ${tally(count)}` : 0}</span></h2>
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

WorkflowOverview.propTypes = {
  dispatch: PropTypes.func,
  workflows: PropTypes.object
};

export default withRouter(connect(
  (state) => ({ workflows: state.workflows })
)(WorkflowOverview));
