import React from 'react';
import PropTypes from 'prop-types';

const SelectWidget = ({ value, onChange, options }) => {
  const { enumOptions, backgroundColor } = options;
  return (
    <select
      className="form-control"
      style={{ backgroundColor }}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      aria-label={value}
      name={value}>
      {enumOptions.map(({ label, value }, i) => {
        return (
          <option key={i} value={value}>
            {label}
          </option>
        );
      })}
    </select>
  );
};

SelectWidget.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func,
  options: PropTypes.object
};

export default SelectWidget;
