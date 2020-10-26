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
  constructor (props) {
    super(props);
    this.displayName = `${props.model} Builder`;
    this.model = props.model;
    this.formData = props.formData || {};
  }

  componentDidMount () {
  }

  render () {
    return (
      <Form schema={this.model} formData={this.formData}
        ArrayFieldTemplate={ArrayFieldTemplate}
        ObjectFieldTemplate={ObjectFieldTemplate}
        FieldTemplate={FieldTemplate}/>
    );
  }
}

ModelBuilder.propTypes = {
  model: PropTypes.object,
  formData: PropTypes.object
}

export default ModelBuilder;
