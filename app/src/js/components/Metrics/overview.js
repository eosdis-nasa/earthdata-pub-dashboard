'use strict';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { lastUpdated } from '../../utils/format';
import {
  listMetrics,
  // searchMetrics,
  // clearMetricsSearch
} from '../../actions';
import List from '../Table/Table';
// import Search from '../Search/search';
import { tableColumns } from '../../utils/table-config/metrics';
// import ListFilters from '../ListActions/ListFilters';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

const breadcrumbConfig = [
  {
    label: 'Dashboard Home',
    href: '/'
  },
  {
    label: 'Metrics',
    active: true
  }
];

const MetricOverview = ({ metrics }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(listMetrics({ count: true }));
  }, [metrics.searchString, dispatch]);
  const { queriedAt } = metrics.list.meta;
  return (
    <div className='page__component'>
      <section className='page__section page__section__controls'>
        <Breadcrumbs config={breadcrumbConfig} />
      </section>
      <section className='page__section page__section__header-wrapper'>
        <div className='page__section__header'>
          <h1 className='heading--large heading--shared-content with-description '>{strings.metric_overview}</h1>
          {lastUpdated(queriedAt)}
        </div>
      </section>
      <section className='page__section'>
        <div className='heading__wrapper--border'>
          <h2 className='heading--medium heading--shared-content with-description'>{strings.all_metrics} <span className='num--title'>{metrics.list.data.length}</span></h2>
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
