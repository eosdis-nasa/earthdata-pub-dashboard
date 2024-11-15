'use strict';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import {
  listForms
} from '../../actions';
import { lastUpdated } from '../../utils/format';
import { tableColumns } from '../../utils/table-config/forms';
import List from '../Table/Table';
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
  const { queriedAt } = forms.list.meta;
  
  return (
    <div className='page__component'>
      <section className='page__section page__section__controls'>
        <Breadcrumbs config={breadcrumbConfig} />
      </section>
      <section className='page__section page__section__header-wrapper'>
        <div className='page__section__header'>
          <h1 className='heading--large heading--shared-content with-description '>{strings.form_overview}</h1>
          {lastUpdated(queriedAt)}
        </div>
      </section>
      <section className='page__section'>
        <div className='heading__wrapper--border'>
          <h2 className='heading--medium heading--shared-content with-description'>{strings.all_forms} <span className='num--title'>{forms.list.data.length}</span></h2>
          <Link
              className='button button--small button--green button--add-small form-group__element--right new-request-button' to={{ pathname: '/forms/add' }}
          >Add Form
          </Link>
        </div>
        <List
          list={forms.list}
          dispatch={dispatch}
          action={listForms}
          tableColumns={tableColumns}
          query={{}}
          rowId='id'
          filterIdx='short_name'
          filterPlaceholder='Search Forms'
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
