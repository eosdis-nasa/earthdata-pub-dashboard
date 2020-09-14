'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { get } from 'object-path';
import cloneDeep from 'lodash.clonedeep';
import {
  listForms,
  getCount,
  interval,
  filterForms,
  clearFormsFilter
} from '../../actions';
import { lastUpdated, tally, displayCase } from '../../utils/format';
import { tableColumns } from '../../utils/table-config/forms';
import List from '../Table/Table';
import PropTypes from 'prop-types';
import Overview from '../Overview/overview';
import _config from '../../config';
import Dropdown from '../DropDown/dropdown';
import pageSizeOptions from '../../utils/page-size';
import ListFilters from '../ListActions/ListFilters';

const { updateInterval } = _config;

class FormsOverview extends React.Component {
  constructor () {
    super();
    this.queryStats = this.queryStats.bind(this);
    this.generateQuery = this.generateQuery.bind(this);
    this.renderOverview = this.renderOverview.bind(this);
  }

  componentDidMount () {
    this.cancelInterval = interval(this.queryStats, updateInterval, true);
  }

  componentWillUnmount () {
    if (this.cancelInterval) { this.cancelInterval(); }
  }

  queryStats () {
    this.props.dispatch(getCount({
      type: 'collections',
      field: 'forms'
    }));
    this.props.dispatch(getCount({
      type: 'forms',
      field: 'status'
    }));
  }

  generateQuery () {
    return {};
  }

  renderOverview (count) {
    const overview = count.map(d => [tally(d.count), displayCase(d.key)]);
    return <Overview items={overview} inflight={false} />;
  }

  render () {
    const { list } = this.props.forms;
    const { stats } = this.props;
    const { count, queriedAt } = list.meta;

    // Incorporate the collection counts into the `list`
    const mutableList = cloneDeep(list);
    const collectionCounts = get(stats.count, 'data.collections.count', []);

    mutableList.data.forEach(d => {
      d.collections = get(collectionCounts.find(c => c.key === d.name), 'count', 0);
    });
    return (
      <div className='page__component'>
        <section className='page__section page__section__header-wrapper'>
          <h1 className='heading--large heading--shared-content with-description'>Form Overview</h1>
          {lastUpdated(queriedAt)}
        </section>
        <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content'>Forms <span className='num--title'>{count ? `${count}` : 0}</span></h2>
          </div>
          <List
            list={mutableList}
            dispatch={this.props.dispatch}
            action={listForms}
            tableColumns={tableColumns}
            query={this.generateQuery()}
            bulkActions={[]}
            rowId='name'
            sortIdx='timestamp'
          >
            <ListFilters>
              <Dropdown
                options={pageSizeOptions}
                action={filterForms}
                clear={clearFormsFilter}
                paramKey={'limit'}
                label={'Results Per Page'}
                inputProps={{
                  placeholder: 'Results Per Page'
                }}
              />
            </ListFilters>
          </List>
        </section>
      </div>
    );
  }
}

FormsOverview.propTypes = {
  dispatch: PropTypes.func,
  forms: PropTypes.object,
  stats: PropTypes.object
};

export default withRouter(connect(state => state)(FormsOverview));
