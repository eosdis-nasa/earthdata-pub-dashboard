import PropTypes from 'prop-types';
import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

const Tooltip = ({ targetRef, children }) => {
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top - 20 + window.scrollY,
        left: rect.left - 300 + window.scrollX,
      });
    }
  }, [targetRef]);

  if (!coords) return null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'absolute',
        top: coords.top,
        left: coords.left,
        backgroundColor: 'black',
        opacity: '0.75',
        color: 'white',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        width: '250px',
        zIndex: 9999,
      }}
    >
      {children}
    </div>,
    document.body
  );
};

const ReviewerOption = ({ innerProps, data, isFocused }) => {
  const containerRef = useRef();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={containerRef}
      {...innerProps}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '10px',
        backgroundColor: isFocused ? '#2275AA' : 'white',
        color: isFocused ? 'white' : 'black',
        position: 'relative',
        cursor: 'pointer',
      }}
    >
      {data.label}
      {hovered && (
        <Tooltip targetRef={containerRef}>
          <strong>Extension:</strong> {data.info.extension}
          <br />
          <strong>Group(s):</strong> {data.info.groups.join(', ')}
          <br />
          <strong>Role(s):</strong> {data.info.roles.join(', ')}
        </Tooltip>
      )}
    </div>
  );
};

Tooltip.propTypes = {
  targetRef: PropTypes.object,
  children: PropTypes.object,
};

ReviewerOption.propTypes = {
  innerProps: PropTypes.object,
  data: PropTypes.object,
  isFocused: PropTypes.bool
};

export default ReviewerOption;
