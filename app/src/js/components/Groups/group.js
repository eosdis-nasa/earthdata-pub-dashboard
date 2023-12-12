'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter
} from 'react-router-dom';
import {
  getGroup,
} from '../../actions';
import Loading from '../LoadingIndicator/loading-indicator';
import { groupPrivileges } from '../../utils/privileges';
import UploadOverview from '../DataUpload/overview';
import Metadata from '../Table/Metadata';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import _config from '../../config';

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

class GroupOverview extends React.Component {
  constructor (props) {
    super(props);
    this.state = {};
    this.navigateBack = this.navigateBack.bind(this);
  }

  componentDidMount () {
    const { dispatch } = this.props;
    const { groupId } = this.props.match.params;
    dispatch(getGroup(groupId));
  }

  componentWillUnmount () {

  }

  navigateBack () {
    const { history } = this.props;
    history.push('/groups');
  }

  render () {
    const groupId = this.props.match.params.groupId;
    const record = this.props.groups.map[groupId];
    let { canUpload } = groupPrivileges(this.props.privileges);
    if (!record || (record.inflight && !record.data)) {
      return <Loading />;
    }
    const group = record.data;
    if (!group.short_name.match(/ghrc_daac|root_group/)) {
      canUpload = false;
    }
    const breadcrumbConfig = [
      {
        label: 'Dashboard Home',
        href: '/'
      },
      {
        label: 'Groups',
        href: '/groups'
      },
      {
        label: groupId,
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
              Group Overview
            </h1>
          </div>
        </section>
        <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h1 className='heading--small' aria-labelledby={strings.group_overview}>
              {strings.group_overview}
            </h1>
          </div>
          <div className='indented__details'><Metadata data={group} accessors={metaAccessors} /></div>
          {record.data && canUpload ? <UploadOverview /> : null }
        </section>
      </div>
    );
  }
}

GroupOverview.propTypes = {
  match: PropTypes.object,
  dispatch: PropTypes.func,
  groups: PropTypes.object,
  logs: PropTypes.object,
  history: PropTypes.object,
  privileges: PropTypes.object,
  roles: PropTypes.array
};

export default withRouter(connect(state => ({
  groups: state.groups,
  privileges: state.api.tokens.privileges,
  logs: state.logs
}))(GroupOverview));
