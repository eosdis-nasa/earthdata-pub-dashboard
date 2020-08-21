'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  getUser,
  updateUser,
  clearUpdateUser
} from '../../actions';
import EditRecord from '../Edit/edit';

const SCHEMA_KEY = 'user';

class EditUser extends React.Component {
  render () {
    const { userId } = this.props.match.params;
    return (
      <EditRecord
        merge={true}
        pk={userId}
        schemaKey={SCHEMA_KEY}
        state={this.props.users}
        getRecord={getUser}
        updateRecord={updateUser}
        clearRecordUpdate={clearUpdateUser}
        backRoute={`/users/user/${userId}`}
      />
    );
  }
}

EditUser.propTypes = {
  match: PropTypes.object,
  users: PropTypes.object
};

export default withRouter(connect(state => ({
  users: state.users
}))(EditUser));
