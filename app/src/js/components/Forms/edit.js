'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  getForm,
  updateForm,
  clearUpdateForm
} from '../../actions';
import EditRecord from '../Edit/edit';
const SCHEMA_KEY = 'form';

class EditForm extends React.Component {
  render () {
    const { formId } = this.props.match.params;
    return (
      <EditRecord
        merge={true}
        pk={formId}
        schemaKey={SCHEMA_KEY}
        state={this.props.forms}
        getRecord={getForm}
        updateRecord={updateForm}
        clearRecordUpdate={clearUpdateForm}
        backRoute={`/forms/id/${formId}`}
      />
    );
  }
}

EditForm.propTypes = {
  match: PropTypes.object,
  forms: PropTypes.object
};

export default withRouter(connect(state => ({
  forms: state.forms
}))(EditForm));
