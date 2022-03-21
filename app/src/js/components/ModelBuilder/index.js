'use strict';
import React from 'react';
import Form from '@rjsf/core';
import ArrayFieldTemplate from './templates/array-field-template';
import ObjectFieldTemplate from './templates/object-field-template';
import FieldTemplate from './templates/field-template';
import SelectWidget from './widgets/select-widget';
import PropTypes from 'prop-types';

class ModelBuilder extends React.Component {
  constructor ({ model, formData, onSubmit }) {
    super();
    this.displayName = `${model} Builder`;
    this.model = model;
    this.formData = formData || {};
    this.onSubmit = onSubmit;
  }

  render () {
    console.log(this.model)
    return (
      <Form schema={this.model} formData={this.formData}
        ArrayFieldTemplate={ArrayFieldTemplate}
        ObjectFieldTemplate={ObjectFieldTemplate}
        FieldTemplate={FieldTemplate}
        widgets={{ SelectWidget }}
        noValidate={true}
        noHtml5Validate={true}
        liveValidate={true}
        onSubmit={this.onSubmit} >
        <button className='button button--small' type="submit" aria-label="submit button">Submit</button>
      </Form>
    );
  }
}

ModelBuilder.propTypes = {
  model: PropTypes.object,
  formData: PropTypes.object,
  onSubmit: PropTypes.func
};

export default ModelBuilder;
