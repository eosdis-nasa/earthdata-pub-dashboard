import { Button, FormControl, Table, OverlayTrigger, Tooltip, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQuestionCircle,
  faPlus,
  faTrashAlt,
  faArrowUp,
  faEdit,
  faArrowDown,
} from '@fortawesome/free-solid-svg-icons';
import React, { forwardRef, useState } from 'react';

// Wrap FontAwesomeIcon inside forwardRef
const ForwardedFontAwesomeIcon = forwardRef((props, ref) => (
  <span ref={ref}>
    <FontAwesomeIcon {...props} />
  </span>
));

const renderTooltip = (props) => (
  <Tooltip id="tooltip-volume" {...props} className="big-tooltip">
    {props}
  </Tooltip>
);

const fieldLabels = {
  data_product_name: "Name of Data Product",
  data_prod_timeline: "Data Production Timeline",
  data_prod_volume: "Data Product Volume",
  instrument_collect_data: "Instrument",
  data_prod_doi: "Data Product DOI",
  data_prod_grid: "Gridded Data Product",
  data_prod_file_format: "File Format",
  data_prod_granule: "Granule Details",
  data_prod_params: "Data Product Parameters/Science Variables",
  data_prod_temporal_coverage: "Data Product Temporal Coverage and Resolution",
  data_prod_spatial_coverage: "Spatial Coverage and Resolution",
  data_prod_ingest_frequency: "Ingest Frequency",
  data_prod_comments: "Comments",
};

const DynamicTable = ({
  controlId,
  values,
  handleFieldChange,
  handleTableFieldChange,
  addRow,
  removeRow,
  moveUpDown,
  sectionHeader,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [modalFields, setModalFields] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [errors, setErrors] = useState({});

  const handleOpenModal = (fields, row = {}, rowIndex = null) => {
    setFormData(row); // prefill with row values (empty if new)
    setModalFields(fields);
    setErrors({});
    setEditIndex(rowIndex); // null = new row, number = edit row
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSaveRow = () => {
    const requiredFields = [
      "data_product_name",
      "data_prod_timeline",
      "data_prod_volume",
      "instrument_collect_data",
      "data_prod_grid",
      "data_prod_file_format",
      "data_prod_granule",
      "data_prod_params",
      "data_prod_temporal_coverage",
      "data_prod_spatial_coverage",
      "data_prod_ingest_frequency",
    ];

    let newErrors = {};
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === "") {
        newErrors[field] = `${fieldLabels[field]} is required`;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      if (editIndex !== null) {
        // update existing row
        Object.keys(formData).forEach((field) => {
          handleTableFieldChange(controlId, editIndex, field, formData[field]);
        });
      } else {
        // add new row with formData
        addRow(controlId, { ...formData });
      }

      setShowModal(false);
      setEditIndex(null);
    }
  };

  const renderModal = () => (
    <Modal show={showModal} onHide={handleCloseModal} size="xl" centered className="wide-modal custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          <span className="dataprod">Data Product Information</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <div className="container-fluid">
            <div className="row g-4">
              {/* LEFT COLUMN */}
              <div className="col-md-6">
                {/* Name */}
                <Form.Group className="mb-3 custom-input">
                  <Form.Label className="fw-bold">
                    Name of data product: How do you refer to the data product?{" "}
                    <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Name of Data Product"
                    value={formData.data_product_name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, data_product_name: e.target.value })
                    }
                    isInvalid={!!errors.data_product_name}
                  />
                  {errors.data_product_name && (
                    <div className="text-danger small mt-1">{errors.data_product_name}</div>
                  )}
                </Form.Group>

                {/* Timeline */}
                <Form.Group className="mb-3 custom-input">
                  <Form.Label className="fw-bold">
                    Data Production Timeline: Include the start date and when you expect data production to be complete. <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Data Production Timeline"
                    value={formData.data_prod_timeline || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, data_prod_timeline: e.target.value })
                    }
                    isInvalid={!!errors.data_prod_timeline}
                  />
                  {errors.data_prod_timeline && (
                    <div className="text-danger small mt-1">{errors.data_prod_timeline}</div>
                  )}
                </Form.Group>

                {/* Volume */}
                <Form.Group className="mb-3 custom-input">
                  <Form.Label className="fw-bold">
                    Data Product Volume: What is the estimated or actual total volume of the data product upon completion of production?
                    <OverlayTrigger
                  placement="top"
                  overlay={renderTooltip(
                    'The DAAC uses the total volume of the final data product to plan data storage requirements. If the final data product is not complete, please provide your best estimate for the total data volume.'
                  )}
                  delay={{ show: 250, hide: 400 }}
                >
                  <ForwardedFontAwesomeIcon
                    icon={faQuestionCircle}
                    style={{ cursor: 'pointer', marginLeft: '5px' }}
                  />
                </OverlayTrigger>{" "}
                    <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Data Product Volume"
                    value={formData.data_prod_volume || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, data_prod_volume: e.target.value })
                    }
                    isInvalid={!!errors.data_prod_volume}
                  />
                  {errors.data_prod_volume && (
                    <div className="text-danger small mt-1">{errors.data_prod_volume}</div>
                  )}
                </Form.Group>

                {/* Instrument */}
                <Form.Group className="mb-3 custom-input">
                  <Form.Label className="fw-bold">
                    Instrument: What instrument is used to collect data?{" "}
                    <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Instrument"
                    value={formData.instrument_collect_data || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, instrument_collect_data: e.target.value })
                    }
                    isInvalid={!!errors.instrument_collect_data}
                  />
                  {errors.instrument_collect_data && (
                    <div className="text-danger small mt-1">{errors.instrument_collect_data}</div>
                  )}
                </Form.Group>

                {/* DOI (optional) */}
                <Form.Group className="mb-3 custom-input">
                  <Form.Label className="fw-bold">
                    Data Product DOI(s): If applicable, for any existing Data Products. Do not list any journal article DOIs here.
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Data Product DOI(s)"
                    value={formData.data_prod_doi || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, data_prod_doi: e.target.value })
                    }
                  />
                </Form.Group>

                {/* Grid */}
                <Form.Group className="mb-3 custom-input">
                  <Form.Label className="fw-bold">
                    Is this a gridded data product? <span className="text-danger">*</span>
                  </Form.Label>
                  <div className="d-flex gap-3 align-items-center">
                    <label className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data_prod_grid"
                        value="Yes"
                        checked={formData.data_prod_grid === "Yes"}
                        onChange={() => setFormData({ ...formData, data_prod_grid: "Yes" })}
                      />
                      <span className="form-check-label">Yes</span>
                    </label>

                    <label className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data_prod_grid"
                        value="No"
                        checked={formData.data_prod_grid === "No"}
                        onChange={() => setFormData({ ...formData, data_prod_grid: "No" })}
                      />
                      <span className="form-check-label">No</span>
                    </label>
                  </div>

                  {errors.data_prod_grid && (
                    <div className="text-danger small mt-1">{errors.data_prod_grid}</div>
                  )}
                </Form.Group>

                {/* File Format */}
                <Form.Group className="mb-3 custom-input">
                  <Form.Label className="fw-bold">
                    File format(s) of the data product <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter File Format"
                    value={formData.data_prod_file_format || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, data_prod_file_format: e.target.value })
                    }
                    isInvalid={!!errors.data_prod_file_format}
                  />
                  {errors.data_prod_file_format && (
                    <div className="text-danger small mt-1">{errors.data_prod_file_format}</div>
                  )}
                </Form.Group>

                {/* Granule */}
                <Form.Group className="mb-3 custom-input">
                  <Form.Label className="fw-bold">
                    Granule definition (spatial/temporal granularity) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Data Product Granule/File Size"
                    value={formData.data_prod_granule || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, data_prod_granule: e.target.value })
                    }
                    isInvalid={!!errors.data_prod_granule}
                  />
                  {errors.data_prod_granule && (
                    <div className="text-danger small mt-1">{errors.data_prod_granule}</div>
                  )}
                </Form.Group>

                {/* Parameters */}
                <Form.Group className="mb-3 custom-input">
                  <Form.Label className="fw-bold">
                    Data Product Parameters/Science Variables: List all parameters/science variable names found within each data product. <OverlayTrigger
            placement="top"
            overlay={renderTooltip(
              'If there are more than 20, describe them all as a group in general terms.'
            )}
            delay={{ show: 250, hide: 400 }}
          >
            <ForwardedFontAwesomeIcon
              icon={faQuestionCircle}
              style={{ cursor: 'pointer', marginLeft: '5px' }}
            />
          </OverlayTrigger> {" "}
                    <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Parameters"
                    value={formData.data_prod_params || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, data_prod_params: e.target.value })
                    }
                    isInvalid={!!errors.data_prod_params}
                  />
                  {errors.data_prod_params && (
                    <div className="text-danger small mt-1">{errors.data_prod_params}</div>
                  )}
                </Form.Group>

                {/* Temporal Coverage */}
                <Form.Group className="mb-3 custom-input">
                  <Form.Label className="fw-bold">
                    Data Product Temporal Coverage and Resolution	{" "}
                    <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Temporal Coverage"
                    value={formData.data_prod_temporal_coverage || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, data_prod_temporal_coverage: e.target.value })
                    }
                    isInvalid={!!errors.data_prod_temporal_coverage}
                  />
                  {errors.data_prod_temporal_coverage && (
                    <div className="text-danger small mt-1">{errors.data_prod_temporal_coverage}</div>
                  )}
                </Form.Group>

                {/* Spatial Coverage */}
                <Form.Group className="mb-3 custom-input">
                  <Form.Label className="fw-bold">
                    Spatial Coverage and Resolution <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Spatial Coverage"
                    value={formData.data_prod_spatial_coverage || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, data_prod_spatial_coverage: e.target.value })
                    }
                    isInvalid={!!errors.data_prod_spatial_coverage}
                  />
                  {errors.data_prod_spatial_coverage && (
                    <div className="text-danger small mt-1">{errors.data_prod_spatial_coverage}</div>
                  )}
                </Form.Group>

                {/* Ingest Frequency */}
                <Form.Group className="mb-3 custom-input">
                  <Form.Label className="fw-bold">
                    Ingest Frequency: List how often each Data Product will be delivered	<OverlayTrigger
            placement="top"
            overlay={renderTooltip('Once, daily, monthly, yearly, etc.')}
            delay={{ show: 250, hide: 400 }}
          >
            <ForwardedFontAwesomeIcon
              icon={faQuestionCircle}
              style={{ cursor: 'pointer', marginLeft: '5px' }}
            />
          </OverlayTrigger>  {" "}<span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Ingest Frequency"
                    value={formData.data_prod_ingest_frequency || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, data_prod_ingest_frequency: e.target.value })
                    }
                    isInvalid={!!errors.data_prod_ingest_frequency}
                  />
                  {errors.data_prod_ingest_frequency && (
                    <div className="text-danger small mt-1">{errors.data_prod_ingest_frequency}</div>
                  )}
                </Form.Group>
              </div>
            </div>
          </div>

          {/* Comments (optional) */}
          <div className="row mt-3">
            <div className="col-12">
              <Form.Group className="mb-3 custom-input">
                <Form.Label className="fw-bold">Comments</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter comments"
                  value={formData.data_prod_comments || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, data_prod_comments: e.target.value })
                  }
                />
              </Form.Group>
            </div>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSaveRow}>
          Add to Table
        </Button>
      </Modal.Footer>
    </Modal>
  );


  // ----------------------
  // Case 1: dar_form_* tables
  // ----------------------
  if (controlId && controlId.startsWith('dar_form_') && sectionHeader !== 'Data Evaluation Request') {
    return (
      <>
        <Table bordered responsive hover className="mt-3">
          <thead className="custom-table-header">
            <tr>
              <th>Name of data product: How do you refer to the data product? </th>
              <th>
                Data Production Timeline: Include the start date and when do you expect data
                production to be complete.
              </th>
              <th>
                Data Product Volume: What is the estimated or actual total volume of the data product
                upon completion of production?{' '}
                <OverlayTrigger
                  placement="top"
                  overlay={renderTooltip(
                    'The DAAC uses the total volume of the final data product to plan data storage requirements. If the final data product is not complete, please provide your best estimate for the total data volume.'
                  )}
                  delay={{ show: 250, hide: 400 }}
                >
                  <ForwardedFontAwesomeIcon
                    icon={faQuestionCircle}
                    style={{ cursor: 'pointer', marginLeft: '5px' }}
                  />
                </OverlayTrigger>
              </th>
              <th>Instrument: What instrument is used to collect data?</th>
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
                      className="tableDynamic"
                      type="text"
                      name="data_product_name"
                      value={row.data_product_name || ''}
                      onChange={(e) =>
                        handleTableFieldChange(controlId, index, 'data_product_name', e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <FormControl
                      className="tableDynamic"
                      type="text"
                      name="data_prod_timeline"
                      value={row.data_prod_timeline || ''}
                      onChange={(e) =>
                        handleTableFieldChange(controlId, index, 'data_prod_timeline', e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <FormControl
                      className="tableDynamic"
                      type="text"
                      name="data_prod_volume"
                      value={row.data_prod_volume || ''}
                      onChange={(e) =>
                        handleTableFieldChange(controlId, index, 'data_prod_volume', e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <FormControl
                      className="tableDynamic"
                      type="text"
                      name="instrument_collect_data"
                      value={row.instrument_collect_data || ''}
                      onChange={(e) =>
                        handleTableFieldChange(controlId, index, 'instrument_collect_data', e.target.value)
                      }
                    />
                  </td>
                  <td style={{ width: '120px', textAlign: 'center' }}>
                    <div className="button-group">
                      <Button
                        variant="secondary"
                        size="sm"
                        aria-label="remove row button"
                        onClick={() => removeRow(controlId, index)}
                        disabled={values[controlId].length === 1}
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
      </>
    );
  }

  // ----------------------
  // Case 2: Data Evaluation Request
  // ----------------------
  if (sectionHeader === 'Data Evaluation Request') {
    const fields = {
      data_product_name: 'Name of data product: How do you refer to the data product?',
      data_prod_timeline:
        'Data Production Timeline: Include the start date and when you expect data production to be complete.',
      data_prod_volume: (
        <>
          Data Product Volume: What is the estimated or actual total volume of the data product upon
          completion of production?
          <OverlayTrigger
            placement="top"
            overlay={renderTooltip(
              'The DAAC uses the total volume of the final data product to plan data storage requirements. If the final data product is not complete, please provide your best estimate for the total data volume.'
            )}
            delay={{ show: 250, hide: 400 }}
          >
            <ForwardedFontAwesomeIcon
              icon={faQuestionCircle}
              style={{ cursor: 'pointer', marginLeft: '5px' }}
            />
          </OverlayTrigger>
        </>
      ),
      instrument_collect_data: 'Instrument: What instrument is used to collect data?',
      data_prod_doi:
        'Data Product DOI(s): If applicable, for any existing Data Products. Do not list any journal article DOIs here.',
      data_prod_grid: 'Is this a gridded data product?',
      data_prod_file_format: 'File format(s) of the data product',
      data_prod_granule: 'Granule definition (spatial/temporal granularity)',
      data_prod_params: (
        <>
          Data Product Parameters/Science Variables: List all parameters/science variable names found
          within each data product.
          <OverlayTrigger
            placement="top"
            overlay={renderTooltip(
              'If there are more than 20, describe them all as a group in general terms.'
            )}
            delay={{ show: 250, hide: 400 }}
          >
            <ForwardedFontAwesomeIcon
              icon={faQuestionCircle}
              style={{ cursor: 'pointer', marginLeft: '5px' }}
            />
          </OverlayTrigger>
        </>
      ),
      data_prod_temporal_coverage: 'Data Product Temporal Coverage and Resolution',
      data_prod_spatial_coverage: 'Spatial Coverage and Resolution',
      data_prod_ingest_frequency: (
        <>
          Ingest Frequency: List how often each Data Product will be delivered
          <OverlayTrigger
            placement="top"
            overlay={renderTooltip('Once, daily, monthly, yearly, etc.')}
            delay={{ show: 250, hide: 400 }}
          >
            <ForwardedFontAwesomeIcon
              icon={faQuestionCircle}
              style={{ cursor: 'pointer', marginLeft: '5px' }}
            />
          </OverlayTrigger>
        </>
      ),
      data_prod_comments: 'Comments',
    };

    return (
      <>
        <div className="table-wrapper">
          <Table bordered hover className="mt-3 custom-table">
            <thead className="custom-table-header">
              <tr>
                {Object.entries(fields).map(([key, label]) => (
                  <th key={key}>{label}</th>
                ))}
                <th className="sticky-col align-middle" style={{ width: '120px' }}>
                  <div  style={{ margin: '30px' }} className="d-flex justify-content-center align-items-center w-100">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() =>
                        handleOpenModal(
                          Object.entries(fields).map(([key, label]) => ({ name: key, label }))
                        )
                      }
                      className="action-button add-row"
                    >
                      <FontAwesomeIcon icon={faPlus} className="me-2" />
                    </Button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(values[controlId]) && 
                values[controlId].map((row, index) => (
                  <tr key={index}>
                    {Object.keys(fields).map((field) => (
                      <td
                        key={field}
                        className="tableDynamicCell"
                        onClick={() =>
                          handleOpenModal(
                            Object.entries(fields).map(([key, label]) => ({ name: key, label })),
                            row,
                            index
                          )
                        }
                        style={{ cursor: 'pointer' }}
                      >
                        {row[field] || ''}
                      </td>
                    ))}
                    <td className="sticky-col" style={{ width: '180px', textAlign: 'center' }}>
                      <div className="d-flex flex-nowrap justify-content-center">
                        {/* Edit button */}
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id={`tooltip-edit-${index}`}>Edit this row</Tooltip>}
                        >
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              handleOpenModal(
                                Object.entries(fields).map(([key, label]) => ({ name: key, label })),
                                row,
                                index
                              )
                            }
                            className="me-1"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                        </OverlayTrigger>

                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id={`tooltip-delete-${index}`}>Delete this row</Tooltip>}
                        >
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => removeRow(controlId, index)}
                            disabled={values[controlId].length === 1}
                            className="me-1"
                          >
                            <FontAwesomeIcon icon={faTrashAlt} />
                          </Button>
                        </OverlayTrigger>
                         {/* {index > 0 && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => moveUpDown(controlId, index, "up")}
                            className="me-1"
                          >
                            <FontAwesomeIcon icon={faArrowUp} />
                          </Button>
                        )}
                        {index < values[controlId].length - 1 && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => moveUpDown(controlId, index, "down")}
                          >
                            <FontAwesomeIcon icon={faArrowDown} />
                          </Button>
                        )} */}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>
        {renderModal()}
      </>
    );
  }

  // ----------------------
  // Case 3: Default name table
  // ----------------------
  return (
    <>
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
                  onChange={(e) => handleTableFieldChange(controlId, index, 'producer_first_name', e.target.value)}
                />
              </td>
              <td>
                <FormControl
                  className='tableDynamic'
                  type="text"
                  name="middleInitial"
                  value={row.producer_middle_initial || ''}
                  onChange={(e) => handleTableFieldChange(controlId, index, 'producer_middle_initial', e.target.value)}
                />
              </td>
              <td>
                <FormControl
                  className='tableDynamic'
                  type="text"
                  name="lastName"
                  value={row.producer_last_name_or_organization || ''}
                  onChange={(e) => handleTableFieldChange(controlId, index, 'producer_last_name_or_organization', e.target.value)}
                />
              </td>
              <td style={{ width: '120px', textAlign: 'center' }}>
                <div className="button-group">
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-label="remove row button"
                    onClick={() => removeRow(controlId, index)}
                    disabled={values[controlId].length === 1}
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
    </>
  );
};

export default DynamicTable;
