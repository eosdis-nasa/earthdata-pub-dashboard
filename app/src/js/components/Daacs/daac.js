'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter
} from 'react-router-dom';
import {
  getDaac,
} from '../../actions';
import Loading from '../LoadingIndicator/loading-indicator';
import Metadata from '../Table/Metadata';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

const metaAccessors = [
  {
    label: 'Short Name',
    property: 'short_name'
  },
  {
    label: 'Name',
    property: 'long_name'
  },
  {
    label: 'Description',
    property: 'description'
  }
];

class DaacOverview extends React.Component {
  constructor (props) {
    super(props);
    this.state = {};
    this.navigateBack = this.navigateBack.bind(this);
  }

  componentDidMount () {
    const { dispatch } = this.props;
    const { daacId } = this.props.match.params;
    dispatch(getDaac(daacId));
  }

  componentWillUnmount () {

  }

  navigateBack () {
    const { history } = this.props;
    history.push('/daacs');
  }

  render () {
    const daacId = this.props.match.params.daacId;
    const record = this.props.daacs.map[daacId];
    if (!record || (record.inflight && !record.data)) {
      return <Loading />;
    }
    const daac = record.data;
    const breadcrumbConfig = [
      {
        label: 'Dashboard Home',
        href: '/'
      },
      {
        label: 'Daacs',
        href: '/daacs'
      },
      {
        label: daacId,
        active: true
      }
    ];
    return (
      <div className='page__component'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <section className='page__section page__section__header-wrapper'>
          <div className='page__section__header'>
            <h1 className='heading--large heading--shared-content with-description '>
              Daac Overview
            </h1>
          </div>
        </section>
        <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h1 className='heading--small' aria-labelledby={strings.daac_overview}>
              {strings.daac_overview}
            </h1>
          </div>
          <div className='indented__details'><Metadata data={daac} accessors={metaAccessors} /></div>
        </section>
      </div>
    );
  }
}

DaacOverview.propTypes = {
  match: PropTypes.object,
  dispatch: PropTypes.func,
  daacs: PropTypes.object,
  logs: PropTypes.object,
  history: PropTypes.object,
  privileges: PropTypes.object,
  roles: PropTypes.array
};

export default withRouter(connect(state => ({
  daacs: state.daacs,
  privileges: state.api.tokens.privileges,
  logs: state.logs
}))(DaacOverview));
