import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/Modal';

const DefaultModal = ({
  className = '',
  children,
  title,
  cancelButtonText = 'Cancel',
  confirmButtonText = 'Confirm',
  showModal,
  onCloseModal,
  onConfirm,
  onCancel,
  hasCancelButton = true,
  hasConfirmButton = true,
  confirmButtonClass = 'button--submit',
  cancelButtonClass = 'button--cancel',
  dontShowAgainCheckbox = false,
  dontShowAgainVerbage = '',
  dontShowAgainCallback,
  dontShowAgainClass
}) => {
  function handleCloseModal (e) {
    if (typeof onCloseModal === 'function') {
      onCloseModal(e);
    }
  }

  function handleConfirm (e) {
    if (typeof onConfirm === 'function') {
      onConfirm(e);
      if (typeof dontShowAgainCallback === 'function') {
        dontShowAgainCallback(e);
      }
    }
  }

  function handleCancel (e) {
    if (typeof onCancel === 'function') {
      onCancel(e);
    } else {
      handleCloseModal(e);
    }
  }

  return (
    <Modal
      dialogClassName={className || `default-modal`}
      show={showModal}
      onHide={handleCloseModal}
      centered
      size="md"
      aria-labelledby={`modal__${className}`}
    >
      <Modal.Header className={`${className}__header`} closeButton>
        <Modal.Title id={`modal__${className}`} className={`${className}__title`}>
          { title }
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        { children }
      </Modal.Body>
      <Modal.Footer>
        {dontShowAgainCheckbox &&
          <div className={`${dontShowAgainClass}`}>
            <input type={'checkbox'} name={'dontShowAgain'} id={'dontShowAgain'}></input>
            <label htmlFor={'dontShowAgain'}>{dontShowAgainVerbage}</label>
          </div>}
        {hasCancelButton && <button
          className={`button ${cancelButtonClass} form-group__element--left button__cancel`}
          onClick={handleCancel}>
          { cancelButtonText }
        </button>}
        {hasConfirmButton && <button
          className={`button ${confirmButtonClass} form-group__element--left`}
          onClick={handleConfirm}>
          { confirmButtonText }
        </button>}
      </Modal.Footer>
    </Modal>
  );
};

DefaultModal.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  cancelButtonText: PropTypes.string,
  confirmButtonText: PropTypes.string,
  showModal: PropTypes.bool,
  onCloseModal: PropTypes.func,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  hasCancelButton: PropTypes.bool,
  hasConfirmButton: PropTypes.bool,
  confirmButtonClass: PropTypes.string,
  cancelButtonClass: PropTypes.string,
  dontShowAgainCheckbox: PropTypes.bool,
  dontShowAgainVerbage: PropTypes.string,
  dontShowAgainCallback: PropTypes.func,
  dontShowAgainClass: PropTypes.string
};

export default DefaultModal;
