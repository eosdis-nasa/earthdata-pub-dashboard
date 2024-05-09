import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { get } from 'object-path';
import { nullValue } from '../../utils/format';

const MetadataEditable = ({ data, accessors, userId, dispatch, updateUser }) => {
  const [editProperty, setEditProperty] = useState(null);
  const [editedValue, setEditedValue] = useState('');

  // Function to handle changes in the input field
  const handleInputChange = (event) => {
    setEditedValue(event.target.value);
  };

  // Function to save the edited value
  const saveChanges = (property) => {
    updateUser(dispatch, userId, null, editedValue)
    // Reset edit mode and edited value
    setEditProperty(null);
    setEditedValue('');
  };

  return (
    <dl className='metadata__details'>
      {accessors.map((item, index) => {
        const { label, property, accessor, editable } = item;
        let value = get(data, property);
        if (value !== nullValue && typeof accessor === 'function') {
          value = accessor(value, data);
        }
        return (
          <React.Fragment key={index}>
            {value && 
              <div className="meta__row">
                <dt>{label}</dt>
                <dd>
                  {editable && editProperty === property ? (
                    // Render input field when in edit mode
                    <input
                      type="text"
                      value={editedValue}
                      onChange={handleInputChange}
                      onBlur={() => saveChanges(property)}
                    />
                  ) : (
                    // Render the value or clickable label with icon
                    <span
                      onClick={() => {
                        if (editable) {
                          setEditProperty(property);
                          setEditedValue(value);
                        }
                      }}
                    >
                      {value} {editable && <span className="edit-icon"> </span>}
                    </span>
                  )}
                </dd>
              </div>
            }
          </React.Fragment>
        );
      })}
    </dl>
  );
};

MetadataEditable.propTypes = {
  data: PropTypes.object,
  accessors: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      property: PropTypes.string.isRequired,
      accessor: PropTypes.func,
      editable: PropTypes.bool 
    })
  )
};

export default MetadataEditable;
