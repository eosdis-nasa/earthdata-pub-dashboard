'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { createGroup } from '../../actions';
import AddRecord from '../Add/add';
import PropTypes from 'prop-types';

const SCHEMA_KEY = 'group';

class AddGroup extends React.Component {
  constructor () {
    super();
    this.state = { name: null };
  }

  render () {
    return (
      <AddRecord
        schemaKey={SCHEMA_KEY}
        primaryProperty={'id'}
        title={'Create a group'}
        state={this.props.groups}
        baseRoute={'/groups/group'}
        createRecord={createGroup}
      />
    );
  }
}

AddGroup.propTypes = {
  groups: PropTypes.object
};

export default withRouter(connect(state => ({
  groups: state.groups
}))(AddGroup));
