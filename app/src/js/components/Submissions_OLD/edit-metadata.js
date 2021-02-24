'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import ModelBuilder from '../ModelBuilder';
import Loading from '../LoadingIndicator/loading-indicator';
import {
  getModel,
  getSubmission,
  updateSubmissionMetadata
} from '../../actions';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { get } from 'object-path';

class EditMetadata extends React.Component {
  componentDidMount () {
    const { dispatch } = this.props;
    const { requestId } = this.props.match.params;
    dispatch(getSubmission(requestId));
    dispatch(getModel('UMMC'));
  }

  updateMetadata (payload) {
    const { dispatch } = this.props;
    dispatch(updateSubmissionMetadata(payload));
  }

  render () {
    const requestId = this.props.match.params.requestId;
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
        label: `Edit Metadata: ${requestId}`,
        active: true
      }
    ];
    const submissionInflight = get(this.props, ['requests', 'map', requestId, 'inflight'], true);
    const modelInflight = get(this.props, ['model', 'inflight'], true);
    const metadata = get(this.props, ['requests', 'map', requestId, 'data', 'metadata']);
    const model = get(this.props, ['model', 'data']);
    const onSubmit = ({ formData }, e) => { this.updateMetadata({ id: requestId, metadata: formData }); };
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
          { loading && <Loading /> }
          { !loading && <ModelBuilder model={model} formData={metadata} onSubmit={onSubmit}/> }
        </section>
      </div>
    );
  }
}

EditMetadata.propTypes = {
  dispatch: PropTypes.func,
  model: PropTypes.object,
  match: PropTypes.object
};

export { EditMetadata };

export default withRouter(connect((state) => ({
  model: state.model,
  requests: state.requests
}))(EditMetadata));
