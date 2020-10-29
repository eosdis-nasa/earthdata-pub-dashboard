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
import { get } from 'object-path';

class EditMetadata extends React.Component {
  componentDidMount () {
    const { dispatch } = this.props;
    const { submissionId } = this.props.match.params;
    dispatch(getSubmission(submissionId));
    dispatch(getModel('UMMC'));
  }

  updateMetadata (payload) {
    const { dispatch } = this.props;
    dispatch(updateSubmissionMetadata(payload));
  }

  render () {
    const submissionId = this.props.match.params.submissionId;
    const submissionInflight = get(this.props, ['submissions', 'map', submissionId, 'inflight'], true);
    const modelInflight = get(this.props, ['model', 'inflight'], true);
    const loading = modelInflight || submissionInflight;
    if (loading) {
      return (<Loading />);
    }
    const metadata = get(this.props, ['submissions', 'map', submissionId, 'data', 'metadata']);
    const model = get(this.props, ['model', 'data']);
    const onSubmit = ({ formData }, e) => { this.updateMetadata({ id: submissionId, metadata: formData }); };
    return (
      <div>
        <ModelBuilder model={model} formData={metadata} onSubmit={onSubmit}/>
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
  submissions: state.submissions
}))(EditMetadata));
