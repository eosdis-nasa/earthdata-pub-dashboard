import React from 'react';
import PropTypes from 'prop-types';

function ObjectFieldTemplate ({ className, properties }) {
  return (
    <div className={className}>
      <div className="model-builder-object">
        {properties.map(prop => (
          <div
            className="object-field"
            key={prop.content.key}>
            {prop.content}
          </div>
        ))}
      </div>
    </div>
  );
}

ObjectFieldTemplate.propTypes = {
  className: PropTypes.string,
  properties: PropTypes.array
};

export default ObjectFieldTemplate;
