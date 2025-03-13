import { Button, FormControl, Table, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faPlus, faTrashAlt, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import React, { forwardRef } from 'react';

// Wrap FontAwesomeIcon inside forwardRef
const ForwardedFontAwesomeIcon = forwardRef((props, ref) => (
  <span ref={ref}>
    <FontAwesomeIcon {...props} />
  </span>
));

const renderTooltip = (props) => (
  <Tooltip id="tooltip-volume" {...props}>
    The DAAC uses the total volume of the final data product to plan data storage requirements. If the final data
    product is not complete, please provide your best estimate for the total data volume.
  </Tooltip>
);

const DynamicTable = ({ controlId, values, handleFieldChange, addRow, removeRow, moveUpDown }) => {
  if(controlId && controlId.startsWith('assignment_')){
    return <Table bordered responsive hover className="mt-3">
    <thead className="custom-table-header">
      <tr>
        <th>Name of data product: How do you refer to the data product? </th>
        <th>Data Production Timeline: Include the start date and when do you expect data production to be complete.</th>
        <th>
        Data Product Volume: What is the estimated or actual total volume of the data product upon completion?{' '}
        <OverlayTrigger placement="top" overlay={renderTooltip} delay={{ show: 250, hide: 400 }}>
              <ForwardedFontAwesomeIcon icon={faQuestionCircle} style={{ cursor: 'pointer', marginLeft: '5px' }} />
            </OverlayTrigger>
          </th>
        <th>Instrument: What instrument  is used to collect data?</th>
        <th style={{ width: '60px', textAlign: 'center' }}>
          <Button
            variant="secondary"
            size="sm"
            aria-label="add row button"
            onClick={() => addRow(controlId)}
            className="action-button add-row"
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
                  name="data_prod_timeline"
                  value={row.data_product_name|| ''}
                  onChange={(e) => handleFieldChange(controlId, index, 'data_product_name', e.target.value)}
                />
              </td>
              <td>
                <FormControl
                  className='tableDynamic'
                  type="text"
                  name="data_prod_volume"
                  value={row.data_prod_volume || ''}
                  onChange={(e) => handleFieldChange(controlId, index, 'data_prod_volume', e.target.value)}
                />
              </td>
              <td>
                <FormControl
                  className='tableDynamic'
                  type="text"
                  name="lastName"
                  value={row.data_prod_timeline || ''}
                  onChange={(e) => handleFieldChange(controlId, index, 'data_prod_timeline', e.target.value)}
                />
              </td>
              <td>
                <FormControl
                  className='tableDynamic'
                  type="text"
                  name="lastName"
                  value={row.instrument_collect_data || ''}
                  onChange={(e) => handleFieldChange(controlId, index, 'instrument_collect_data', e.target.value)}
                />
              </td>
              <td style={{ width: '120px', textAlign: 'center' }}>
                <div className="button-group">
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-label="remove row button"
                    onClick={() => removeRow(controlId, index)}
                    className="action-button"
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </Button>
                  {index > 0 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      aria-label="move up button"
                      onClick={() => moveUpDown(controlId, index, 'up')}
                      className="action-button"
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
                      className="action-button"
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
  }
  else 
  return (
    <Table bordered responsive hover className="mt-3">
      <thead className="custom-table-header">
        <tr>
          <th>First Name</th>
          <th>Middle Initial</th>
          <th>Last Name or Group</th>
          <th style={{ width: '120px', textAlign: 'center' }}>
            <Button
              variant="secondary"
              size="sm"
              aria-label="add row button"
              onClick={() => addRow(controlId)}
              className="action-button add-row"
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
                    className="action-button"
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </Button>
                  {index > 0 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      aria-label="move up button"
                      onClick={() => moveUpDown(controlId, index, 'up')}
                      className="action-button"
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
                      className="action-button"
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
