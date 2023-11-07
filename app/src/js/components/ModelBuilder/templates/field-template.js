import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { Collapse } from 'react-bootstrap';

function FieldTemplate ({ id, classNames, label, help, required, description, errors, children }) {
  const [open, setOpen] = React.useState(true);
  const icon = open ? faAngleDown : faAngleRight;
  return (
    <div className={'model-builder-field'}>
      <label htmlFor={id} onClick={() => { setOpen(!open); }}>
        { label || 'Please enter:'} <FontAwesomeIcon icon={icon} />
      </label>
      <Collapse in={open}>
        <div>
          {description}
          {children}
          {errors}
          {help}
        </div>
      </Collapse>
    </div>
  );
}

FieldTemplate.propTypes = {
  id: PropTypes.string,
  classNames: PropTypes.string,
  label: PropTypes.string,
  help: PropTypes.object,
  required: PropTypes.bool,
  description: PropTypes.object,
  errors: PropTypes.object,
  children: PropTypes.object
};

export default FieldTemplate;
