'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import ModelBuilder from '../ModelBuilder';
import Loading from '../LoadingIndicator/loading-indicator';
import {
  getModel,
  getRequest,
  updateRequestMetadata
} from '../../actions';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

class EditMetadata extends React.Component {
  componentDidMount () {
    const { dispatch } = this.props;
    const { requestId } = this.props.match.params;
    dispatch(getRequest(requestId));
    dispatch(getModel('UMMC'));
  }

  navigateBack () {
    const { history } = this.props;
    const { requestId } = this.props.match.params;
    history.push(`/requests/id/${requestId}`);
  }

  updateMetadata (payload) {
    const { dispatch } = this.props;
    dispatch(updateRequestMetadata(payload));
  }

  render () {
    const { requestId } = this.props.match.params;
    const record = this.props.requests.detail;
    const { model } = this.props;
    const loading = model.inflight || record.inflight;
    const request = record.data || false;
    const onSubmit = ({ formData }, e) => { this.updateMetadata({ id: requestId, metadata: formData }); console.log('formData', model.data); };
    const breadcrumbConfig = [
      {
        label: 'Dashboard Home',
        href: '/'
      },
      {
        label: 'Requests',
        href: '/requests'
      },
      {
        label: requestId,
        href: `/requests/id/${requestId}`
      },
      {
        label: 'Edit Metdata',
        active: true
      }
    ];
    return (
      <div className='page__component'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <section className='page__section page__section__header-wrapper'>
          <h1 className='heading--large heading--shared-content with-description width--three-quarters'>
            {requestId}
          </h1>
        </section>
        <section className='page__section'>
          { loading
            ? <Loading />
            : <ModelBuilder model={model.data} formData={request.metadata} onSubmit={onSubmit}/> }
        </section>
      </div>);
  }
}

EditMetadata.propTypes = {
  dispatch: PropTypes.func,
  history: PropTypes.object,
  requests: PropTypes.object,
  model: PropTypes.object,
  match: PropTypes.object
};

export { EditMetadata };

export default withRouter(connect((state) => ({
  model: state.model,
  requests: state.requests
}))(EditMetadata));
