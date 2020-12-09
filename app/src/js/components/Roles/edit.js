'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  getRole,
  updateRole,
  clearUpdateRole
} from '../../actions';
import EditRecord from '../Edit/edit';
const SCHEMA_KEY = 'role';

class EditRole extends React.Component {
  render () {
    const { roleId } = this.props.match.params;
    return (
      <EditRecord
        merge={true}
        pk={roleId}
        schemaKey={SCHEMA_KEY}
        state={this.props.roles}
        getRecord={getRole}
        updateRecord={updateRole}
        clearRecordUpdate={clearUpdateRole}
        backRoute={`/roles/role/${roleId}`}
      />
    );
  }
}

EditRole.propTypes = {
  match: PropTypes.object,
  roles: PropTypes.object
};

export default withRouter(connect(state => ({
  roles: state.roles
}))(EditRole));
