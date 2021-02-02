'use strict';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { tally, lastUpdated } from '../../utils/format';
import {
  listMetrics,
  searchMetrics,
  clearMetricsSearch
} from '../../actions';
import List from '../Table/Table';
import Search from '../Search/search';
import { tableColumns } from '../../utils/table-config/metrics';
import ListFilters from '../ListActions/ListFilters';

const MetricOverview = ({ metrics }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(listMetrics({ count: true }));
  }, [metrics.searchString, dispatch]);
  const count = metrics.list.data.length;
  const { queriedAt } = metrics.list.meta;

  return (
    <div className='page__component'>
      <section className='page__section page__section__header-wrapper'>
        {lastUpdated(queriedAt)}
      </section>
      <section className='page__section'>
        <div className='heading__wrapper--border'>
          <h2 className='heading--medium heading--shared-content with-description'>All Metrics <span className='num--title'>{count ? ` ${tally(count)}` : 0}</span></h2>
        </div>
        <List
          list={metrics.list}
          dispatch={dispatch}
          action={listMetrics}
          tableColumns={tableColumns}
          query={{}}
          bulkActions={[]}
          rowId='name'
          sortIdx='name'
        >
          {/* <ListFilters>
            <Search
              dispatch={dispatch}
              action={searchMetrics}
              clear={clearMetricsSearch}
              label='Search'
              placeholder="Metric Name"
            />
          </ListFilters> */}
        </List>
      </section>
    </div>
  );
};

MetricOverview.propTypes = {
  dispatch: PropTypes.func,
  metrics: PropTypes.object
};

export default withRouter(connect(
  (state) => ({ metrics: state.metrics })
)(MetricOverview));
