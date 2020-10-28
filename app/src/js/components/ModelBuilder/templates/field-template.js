import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { Collapse } from 'react-bootstrap';

function FieldTemplate(props) {
  const {id, classNames, label, help, required, description, errors, children} = props;
  const [open, setOpen] = React.useState(true);
  const icon = open ? faAngleDown : faAngleRight;
  return (
    <div className={`model-builder-field`}>
      <label htmlFor={id} onClick={() => {setOpen(!open)}}>
        {label} <FontAwesomeIcon icon={icon} />
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

export default FieldTemplate;
