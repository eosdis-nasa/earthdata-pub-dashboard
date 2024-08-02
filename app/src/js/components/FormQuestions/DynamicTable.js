import React from 'react';
import { Button, FormControl, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrashAlt, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';

const DynamicTable = ({ controlId, values, handleFieldChange, addRow, removeRow, moveUpDown }) => {
  return (
    <Table bordered responsive>
      <thead>
        <tr>
          <th>First Name</th>
          <th>Middle Initial</th>
          <th>Last Name or Group</th>
          <th style={{ width: '120px', textAlign: 'center' }}>
            <Button
              variant="outline-primary"
              size="sm"
              aria-label="add row button"
              onClick={() => addRow(controlId)}
            >
              <FontAwesomeIcon icon={faPlus} />
            </Button>
          </th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(values[controlId]) &&
          values[controlId]?.map((row, index) => (
            <tr key={index}>
              <td>
                <FormControl
                  className='tableDynamic'
                  type="text"
                  name="firstName"
                  value={row.producer_first_name || ''}
                  onChange={(e) => handleFieldChange(controlId, index, 'producer_first_name', e.target.value)}
                />
              </td>
              <td>
                <FormControl
                  className='tableDynamic'
                  type="text"
                  name="middleInitial"
                  value={row.producer_middle_initial || ''}
                  onChange={(e) => handleFieldChange(controlId, index, 'producer_middle_initial', e.target.value)}
                />
              </td>
              <td>
                <FormControl
                  className='tableDynamic'
                  type="text"
                  name="lastName"
                  value={row.producer_last_name_or_organization || ''}
                  onChange={(e) => handleFieldChange(controlId, index, 'producer_last_name_or_organization', e.target.value)}
                />
              </td>
              <td style={{ width: '120px', textAlign: 'center' }}>
                <div className="button-group">
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-label="remove row button"
                    onClick={() => removeRow(controlId, index)}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </Button>
                  {index > 0 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      aria-label="move up button"
                      onClick={() => moveUpDown(controlId, index, 'up')}
                    >
                      <FontAwesomeIcon icon={faArrowUp} />
                    </Button>
                  )}
                  {index < values[controlId].length - 1 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      aria-label="move down button"
                      onClick={() => moveUpDown(controlId, index, 'down')}
                    >
                      <FontAwesomeIcon icon={faArrowDown} />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
      </tbody>
    </Table>
  );
};

export default DynamicTable;
