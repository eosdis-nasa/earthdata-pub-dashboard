'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import EditRaw from '../EditRaw/edit-raw';

const SCHEMA_KEY = 'rule';

const EditRule = ({
  match,
  rules
}) => {
  const { params: { ruleName } } = match;

  return (
    <EditRaw
      pk={ruleName}
      schemaKey={SCHEMA_KEY}
      primaryProperty='name'
      state={rules}
      backRoute={`/rules/rule/${ruleName}`}
      hasModal={true}
    />
  );
};

EditRule.propTypes = {
  match: PropTypes.object,
  rules: PropTypes.object
};

export default withRouter(connect(state => ({
  rules: state.rules
}))(EditRule));
