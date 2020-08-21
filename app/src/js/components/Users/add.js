'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { createUser } from '../../actions';
import AddRecord from '../Add/add';
import PropTypes from 'prop-types';

const SCHEMA_KEY = 'user';

class AddUser extends React.Component {
  constructor () {
    super();
    this.state = { name: null };
  }

  render () {
    return (
      <AddRecord
        schemaKey={SCHEMA_KEY}
        primaryProperty={'id'}
        title={'Create a user'}
        state={this.props.users}
        baseRoute={'/users/user'}
        createRecord={createUser}
      />
    );
  }
}

AddUser.propTypes = {
  users: PropTypes.object
};

export default withRouter(connect(state => ({
  users: state.users
}))(AddUser));
