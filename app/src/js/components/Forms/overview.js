'use strict';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import {
  // getCount,
  // searchForms,
  // clearFormsSearch,
  // filterForms,
  // clearFormsFilter,
  listForms
} from '../../actions';
import { get } from 'object-path';
import { lastUpdated, tally, displayCase } from '../../utils/format';
import { tableColumns } from '../../utils/table-config/forms';
import List from '../Table/Table';
import Overview from '../Overview/overview';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

const breadcrumbConfig = [
  {
    label: 'Dashboard Home',
    href: '/'
  },
  {
    label: 'Forms',
    active: true
  }
];

const FormsOverview = ({ forms }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(listForms());
  }, [forms.searchString, dispatch]);
  // const count = forms.list.data.length;
  const { queriedAt } = forms.list.meta;
  // const { stats } = this.props;
  // const statsCount = get(stats, 'count.data.forms.count', []);
  // const overviewItems = statsCount.map(d => [tally(d.count), displayCase(d.key)]);
  /* render () {
    const { list } = forms;
    const { queriedAt } = list.meta;

     */
  return (
    <div className='page__component'>
      <section className='page__section page__section__controls'>
        <Breadcrumbs config={breadcrumbConfig} />
      </section>
      <section className='page__section page__section__header-wrapper'>
        <div className='page__section__header'>
          <h1 className='heading--large heading--shared-content with-description '>{strings.form_overview}</h1>
          {lastUpdated(queriedAt)}
          {/* <Overview items={overviewItems} inflight={false} />  */}
        </div>
      </section>
      <section className='page__section'>
        <div className='heading__wrapper--border'>
          <h2 className='heading--medium heading--shared-content with-description'>{strings.all_forms} <span className='num--title'>{forms.list.data.length}</span></h2>
        </div>
        <List
          list={forms.list}
          dispatch={dispatch}
          action={listForms}
          tableColumns={tableColumns}
          query={{}}
          rowId='id'
          sortIdx='long_name'
        >
        </List>
      </section>
    </div>
  );
};

FormsOverview.propTypes = {
  forms: PropTypes.object,
  stats: PropTypes.object,
  dispatch: PropTypes.func,
  config: PropTypes.object
};

export { FormsOverview };

export default withRouter(connect(state => ({
  stats: state.stats,
  forms: state.forms,
  config: state.config
}))(FormsOverview));
