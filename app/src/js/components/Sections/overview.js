'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { listSections } from '../../actions';
import { lastUpdated } from '../../utils/format';
import { formPrivileges } from '../../utils/privileges';
import { tableColumns } from '../../utils/table-config/sections';
import List from '../Table/Table';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import Loading from '../LoadingIndicator/loading-indicator';

const breadcrumbConfig = [
  {
    label: 'Dashboard Home',
    href: '/'
  },
  {
    label: 'Sections',
    active: true
  }
];

class SectionsOverview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(listSections()).finally(() => {
      this.setState({ loading: false });
    });
  }

  render() {
    const { sections } = this.props;
    const { loading } = this.state;
    let { list } = sections;
    const { canCreate, canEdit, canRead } = formPrivileges(this.props.privileges);
    if (!list || list.data.constructor.name !== 'Array') {
      list = { data: [], meta: '', count: 0 };
    }

    const { queriedAt } = list.meta;

    return (
      <div className='page__component sections-overview'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <section className='page__section page__section__header-wrapper'>
          <div className='page__section__header'>
            <h1 className='heading--large heading--shared-content with-description '>
              Sections Overview
            </h1>
            {queriedAt ? lastUpdated(queriedAt) : null}
          </div>
        </section>
        <section className='page__section page__section__controls'>
          <div className='heading__wrapper--border' style={{ height: '3rem' }}>
            <h2 className='heading--medium heading--shared-content with-description'>
              All Sections{' '}
              <span className='num--title'>
                {list.data.length > 0 ? list.data.length : 0}
              </span>
            </h2>
            {canCreate && (
              <Link
                className='button button--small button--green button--add-small form-group__element--right new-request-button'
                to={{ pathname: '/sections/add' }}
              >
                Add Section
              </Link>
            )}
          </div>
        </section>
        <section className='page__section page__section__controls'>
          <div>
            {!canRead || loading ? (
              <Loading />
            ) : (
              <List
                list={list}
                action={listSections}
                tableColumns={tableColumns}
                query={{}}
                rowId='id'
                filterIdx='id'
                filterPlaceholder='Search Id'
              />
            )}
          </div>
        </section>
      </div>
    );
  }
}

SectionsOverview.propTypes = {
  dispatch: PropTypes.func,
  privileges: PropTypes.object,
  sections: PropTypes.object
};

export { SectionsOverview };

export default withRouter(
  connect((state) => ({
    privileges: state.api.tokens.privileges,
    sections: state.sections
  }))(SectionsOverview)
);
