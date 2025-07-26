'use strict';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { get } from 'object-path';
import { nullValue } from '../../utils/format';

import { useDispatch } from 'react-redux';
import { getWorkflow } from '../../actions';
import PopupInfoModal from '../../utils/table-config/PopupInfoModal';
import Loading from '../LoadingIndicator/loading-indicator';

const Metadata = ({ data, accessors }) => {
  const dispatch = useDispatch();
  const [workflowSteps, setWorkflowSteps] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

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
          let value = get(data, property);
          if (value !== nullValue && typeof accessor === 'function') {
            value = accessor(value, data);
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
