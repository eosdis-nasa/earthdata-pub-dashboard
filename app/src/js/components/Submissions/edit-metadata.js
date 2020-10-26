'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import ModelBuilder from '../ModelBuilder';
import Loading from '../LoadingIndicator/loading-indicator';
import {
  getModel,
  getSubmission
} from '../../actions';
import { get } from 'object-path';
import { tally } from '../../utils/format';
import { strings } from '../locale';

class EditMetadata extends React.Component {
  constructor (props) {
    super(props);
  }

  componentDidMount () {
    const { dispatch } = this.props;
    const { submissionId } = this.props.match.params;
    dispatch(getSubmission(submissionId));
    dispatch(getModel('UMMC'));
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
    return (
      <div>
        <ModelBuilder model={model} formData={metadata} />
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
