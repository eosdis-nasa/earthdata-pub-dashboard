import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import PopupInfoModal from './PopupInfoModal';
import { getWorkflow } from '../../actions';
import Loading from '../../components/LoadingIndicator/loading-indicator';

const NextActionCell = ({ value, row, workflowId }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [workflowData, setWorkflowData] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleShowInfo = async () => {
    try {
      setLoading(true);
      const result = await dispatch(getWorkflow(workflowId));
      setWorkflowData(result);
      setShowInfo(true);
    } catch (error) {
      console.error('Error fetching workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const label = value?.props?.children;
  const currentStepName = value === 'Completed'
    ? 'close'
    : label?.trim().toLowerCase().replace(/\s+/g, '_') || null;

  return (
    <>
      {loading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <Loading />
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
      }}>
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          {value}
        </div>
        <div style={{ flex: '0 0 auto', width: '12px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleShowInfo}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: 0,
              width: '100%',
              lineHeight: 1
            }}
            aria-label="More info about this action"
            title="Workflow information"
          >
            <i className="fas fa-info-circle"></i>
          </button>
        </div>

        {showInfo && (
          <PopupInfoModal
            title="Information"
            message=""
            workflowData={workflowData}
            onClose={() => setShowInfo(false)}
            currentStep={currentStepName}
          />
        )}
      </div>
    </>
  );
};

export default NextActionCell;
