import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Modal from 'react-bootstrap/Modal';
import { confirmAuthInvalidLogout } from '../../actions';

class AuthInvalidModal extends React.Component {
  constructor (props) {
    super(props);
    this.handleConfirm = this.handleConfirm.bind(this);
  }

  handleConfirm () {
    this.props.dispatch(confirmAuthInvalidLogout());
  }

  render () {
    const { authInvalidNotification } = this.props.api;

    return (
      <Modal
        show={!!authInvalidNotification}
        backdrop="static"
        keyboard={false}
        centered={true}
        aria-labelledby="modal__auth-invalid-modal">
        <Modal.Header>
          <Modal.Title id="modal__auth-invalid-modal">Authentication Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            Your authentication credentials are no longer valid. You will be signed out and redirected to log in again.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            className={'button button__animation--md'}
            onClick={this.handleConfirm}>
            Sign Out
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}

AuthInvalidModal.propTypes = {
  api: PropTypes.object,
  dispatch: PropTypes.func
};

export default connect(state => ({
  api: state.api
}))(AuthInvalidModal);
