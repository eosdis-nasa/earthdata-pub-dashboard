'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { createForm } from '../../actions';
import AddRecord from '../Add/add';
import PropTypes from 'prop-types';

const SCHEMA_KEY = 'form';

class AddForm extends React.Component {
  constructor () {
    super();
    this.state = { name: null };
  }

  render () {
    return (
      <AddRecord
        schemaKey={SCHEMA_KEY}
        primaryProperty={'id'}
        title={'Create a form'}
        state={this.props.forms}
        baseRoute={'/forms/form'}
        createRecord={createForm}
      />
    );
  }
}

AddForm.propTypes = {
  forms: PropTypes.object
};

export default withRouter(connect(state => ({
  forms: state.forms
}))(AddForm));
