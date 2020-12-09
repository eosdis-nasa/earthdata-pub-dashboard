'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { createRole } from '../../actions';
import AddRecord from '../Add/add';
import PropTypes from 'prop-types';

const SCHEMA_KEY = 'role';

class AddRole extends React.Component {
  constructor () {
    super();
    this.state = { name: null };
  }

  render () {
    return (
      <AddRecord
        schemaKey={SCHEMA_KEY}
        primaryProperty={'id'}
        title={'Create a role'}
        state={this.props.roles}
        baseRoute={'/roles/role'}
        createRecord={createRole}
      />
    );
  }
}

AddRole.propTypes = {
  roles: PropTypes.object
};

export default withRouter(connect(state => ({
  roles: state.roles
}))(AddRole));
