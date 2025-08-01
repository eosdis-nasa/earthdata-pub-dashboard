'use strict';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { get } from 'object-path';
import { nullValue } from '../../utils/format';
import { useDispatch } from 'react-redux';
import { getCodesBySubmissionId, getWorkflow } from '../../actions';
import PopupInfoModal from '../../utils/table-config/PopupInfoModal';
import Loading from '../LoadingIndicator/loading-indicator';

const Metadata = ({ data, accessors }) => {
  const dispatch = useDispatch();
  const [codeData, setCodeData] = useState([]);
  const [workflowSteps, setWorkflowSteps] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    if (data?.id) {
      const fetchCodes = async () => {
        try {
          const result = await dispatch(getCodesBySubmissionId(data.id));
          setCodeData(result?.data || result || []);
        } catch (error) {
          console.error('Error fetching code data:', error);
        }
      };
      fetchCodes();
    }
  }, [dispatch, data?.id]);

  const handleWorkflowClick = async () => {
    if (!data?.workflow?.id) return;
    try {
      setLoading(true);
      const result = await dispatch(getWorkflow(data.workflow.id));
      setWorkflowSteps(result);
      setShowInfo(true);
    } catch (error) {
      console.error('Failed to fetch workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

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

      <dl className="metadata__details">
        {accessors.map((item, index) => {
          const { label, property, accessor } = item;

          // Skip if label is 'Workflow'
          if (label === 'Workflow') return null;

          let value = get(data, property);
          if (value !== nullValue && typeof accessor === 'function') {
            value = accessor(value, data, codeData);
          }

          const isNextAction = label === 'Next Action';

          return (
            value && (
              <div className="meta__row" key={index}>
                <dt>{label}</dt>
                <dd>
                  {value}
                  {isNextAction && (
                    <span
                      style={{ marginLeft: '8px', cursor: 'pointer' }}
                      title="Workflow information"
                      onClick={handleWorkflowClick}
                    >
                      <i className="fas fa-info-circle"></i>
                    </span>
                  )}
                </dd>
              </div>
            )
          );
        })}

        {codeData.length > 0 && (
          <div className="meta__row">
            <dt>Publication Codes</dt>
            <dd>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {codeData.map((item, idx) => (
                  <li
                    key={idx}
                    style={{
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {item.short_name}

                    {/* Tooltip wrapper */}
                    <div style={{ position: 'relative'}}>
                      <button
                        onClick={() => handleCopy(item.code, idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#545657ff',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 0
                        }}
                        title="Copy code"
                      >
                        <i className="fas fa-copy" />
                      </button>

                      {/* Tooltip */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: 'calc(100% + 8px)',
                          transform: 'translateY(-50%)',
                          backgroundColor: '#333',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          whiteSpace: 'nowrap',
                          opacity: copiedIndex === idx ? 1 : 0,
                          pointerEvents: 'none',
                          transition: 'opacity 0.2s ease-in-out',
                          zIndex: 1000
                        }}
                      >
                        Publication code copied
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
        {/* Modal for workflow info */}
        {showInfo && (
          <PopupInfoModal
            title="Information"
            message=""
            workflowData={workflowSteps}
            onClose={() => setShowInfo(false)}
            currentStep={data.step_data?.name}
          />
        )}
      </dl>
    </>
  );
};

Metadata.propTypes = {
  data: PropTypes.object.isRequired,
  accessors: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      property: PropTypes.string,
      accessor: PropTypes.func
    })
  ).isRequired
};

export default Metadata;
