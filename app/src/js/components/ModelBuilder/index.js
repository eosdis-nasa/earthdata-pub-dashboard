'use strict';
import React from 'react';
import { connect } from 'react-redux';
import Form from "@rjsf/core";
import ArrayFieldTemplate from './templates/array-field-template';
import ObjectFieldTemplate from './templates/object-field-template';
import FieldTemplate from './templates/field-template';
import PropTypes from 'prop-types';
import { initialValueFromLocation } from '../../utils/url-helper';
import withQueryParams from 'react-router-query-params';
import { withRouter } from 'react-router-dom';

class ModelBuilder extends React.Component {
  constructor ({ model, formData, onSubmit, ...rest }) {
    super({ model, formData, ...rest });
    this.displayName = `${model} Builder`;
    this.model = model;
    this.formData = formData || {};
    this.onSubmit = onSubmit;
  }

  componentDidMount () {
  }

  render () {
    return (
      <Form schema={this.model} formData={this.formData}
        ArrayFieldTemplate={ArrayFieldTemplate}
        ObjectFieldTemplate={ObjectFieldTemplate}
        FieldTemplate={FieldTemplate}
        noValidate={true}
        noHtml5Validate={true}
        liveValidate={true}
        onSubmit={this.onSubmit} >
        <button className='button button--small' type="submit">Submit</button>
      </Form>
    );
  }
}

ModelBuilder.propTypes = {
  model: PropTypes.object,
  formData: PropTypes.object,
  onSubmit: PropTypes.func
}

export default ModelBuilder;
