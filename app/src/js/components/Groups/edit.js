'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  getGroup,
  updateGroup,
  clearUpdateGroup
} from '../../actions';
import EditRecord from '../Edit/edit';
const SCHEMA_KEY = 'group';

class EditGroup extends React.Component {
  render () {
    const { groupId } = this.props.match.params;
    return (
      <EditRecord
        merge={true}
        pk={groupId}
        schemaKey={SCHEMA_KEY}
        state={this.props.groups}
        getRecord={getGroup}
        updateRecord={updateGroup}
        clearRecordUpdate={clearUpdateGroup}
        backRoute={`/groups/id/${groupId}`}
      />
    );
  }
}

EditGroup.propTypes = {
  match: PropTypes.object,
  groups: PropTypes.object
};

export default withRouter(connect(state => ({
  groups: state.groups
}))(EditGroup));
