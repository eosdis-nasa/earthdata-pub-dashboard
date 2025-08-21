import React from 'react';
import ReactDOM from 'react-dom';
import WorkflowArrowBreadCrumb from './BreadCrumb';

const getStepBreadcrumb = (steps) => {
  const breadcrumb = [];
  let currentStep = 'init';

  while (currentStep && steps[currentStep]) {
    breadcrumb.push(currentStep);
    currentStep = steps[currentStep].next_step_name;
  }

  if (!breadcrumb.includes('close') && steps['close']) {
    breadcrumb.push('close');
  }

  return breadcrumb;
};

const PopupInfoModal = ({ title, message, onClose, workflowData, currentStep }) => {
  return ReactDOM.createPortal(
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h1 style={titleStyle}>
          <span style={titleText}>{workflowData.data?.long_name} {title}</span>
        </h1>

        <WorkflowArrowBreadCrumb
          steps={getStepBreadcrumb(workflowData.data.steps)}
          currentStep={currentStep}
        />

        <div style={buttonContainer}>
          <button
            onClick={onClose}
            className='button button--no-icon'
            style={closeButtonStyle}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Styles
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalStyle = {
  backgroundColor: 'white',
  padding: '30px 40px',
  borderRadius: '10px',
  maxWidth: '1300px',
  maxHeight: '90vh',
  overflowY: 'auto',
  textAlign: 'center',
  boxShadow: '0 5px 25px rgba(0,0,0,0.3)',
  fontFamily: 'Segoe UI, sans-serif'
};

const titleStyle = {
  marginBottom: '25px',
  borderBottom: '1px solid #2c3e50',
  paddingBottom: '10px',
};

const titleText = {
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#2c3e50',
};

const buttonContainer = {
  display: 'flex',
  justifyContent: 'center',
  marginTop: '30px',
};

const closeButtonStyle = {
  padding: '12px 24px',
  backgroundColor: 'rgb(219, 20, 0)',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: 500,
};

export default PopupInfoModal;
