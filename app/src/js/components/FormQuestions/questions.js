import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { Button, Form, Container, Row, Col, FormGroup, FormControl, Alert, Spinner, Table, Modal } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo, faUndo, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from 'react-redux';
import './FormQuestions.css';
import DynamicTable from './DynamicTable';
import ScrollToTop from './ScrollToTop';
import {
  shortDateShortTimeYearFirstJustValue,
  calculateStorage,
} from '../../utils/format';
import { saveForm, submitFilledForm, setTokenState, listFileUploadsBySubmission, copyRequest, createTempUploadFile } from '../../actions';
import Loading from '../LoadingIndicator/loading-indicator';
import _config from '../../config';
import { CueFileUtility, LocalUpload } from '@edpub/upload-utility';
import { format } from "date-fns";
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';


const FileStatusHeader = () => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
    }}
  >
    File Status

    <OverlayTrigger
      placement="right"
      overlay={
        <Tooltip id="file-status-tooltip">
          <div>
            <strong>Available</strong>: Uploaded to EDPub bucket
            <br />
            <strong>Scanning</strong>: Uploaded to CUE for file scanning
          </div>
        </Tooltip>
      }
    >
      {/* OverlayTrigger REQUIRES a single DOM child */}
      <span style={{ display: 'inline-flex' }}>
        <FontAwesomeIcon
          icon={faQuestionCircle}
          style={{
            cursor: 'pointer',
            color: 'white',
          }}
          aria-label="File status help"
        />
      </span>
    </OverlayTrigger>
  </span>
);

const FormQuestions = ({
  cancelLabel = 'Cancel',
  draftLabel = 'Save as draft',
  saveLabel = 'Save and continue editing',
  undoLabel = 'Undo',
  redoLabel = 'Redo',
  submitLabel = 'Submit',
  cloneByField = 'Clone By Field',
  clone = 'Clone',
  enterSubmit = false,
  readonly = false,
  disabled = false,
  showCancelButton = true,
  formData,
  requestData,
  sectionHeader
}) => {
  const [values, setValues] = useState({ validation_errors: {} });
  const [questions, setQuestions] = useState([]);
  const [daacInfo, setDaacData] = useState({});
  const [valueHistory, setValueHistory] = useState([{}]);
  const [valueHistoryUndoIdx, setValueHistoryUndoIdx] = useState(0);
  const [alertVariant, setAlertVariant] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [dismissCountDown, setDismissCountDown] = useState(0);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [uploadFlag, setUploadFlag] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileFlag, setUploadFileFlag] = useState(false);
  const [uploadFailed, setUploadFailed] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [fileControlId, setfileControlId] = useState('');

  const [uploadFields, setUploadFields] = useState([
    {
      key: 'file_name',
      label: 'Filename',
    },
    {
      key: 'size',
      label: 'Size',
      formatter: (value) => calculateStorage(value),
    },
    // CUE does not currently return the sha256Checksum so we're commenting for now
    // TODO - request as a feature to CUE that the sha256Checksum is pushed to the s3 object
    // metadata
    // {
    //   key: 'sha256Checksum',
    //   label: 'sha256Checksum',
    // },
    {
      key: 'lastModified',
      label: 'Last Modified',
      formatter: (value) => shortDateShortTimeYearFirstJustValue(value),
    },
    {
      key: 'status',
      label: <FileStatusHeader />,
      formatter: (value) => {
        if (!value) return 'Available';
        if (['uploading', 'unscanned', 'clean', 'scanning'].includes(value)) {
          return 'Scanning';
        }
        return value;
      },
    }
  ]);
  const [logs, setLogs] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [checkboxStatus, setCheckboxStatus] = useState({
    sameAsPrimaryDataProducer: false,
    sameAsPrimaryLongTermSupport: false,
    sameAsPrimaryDataAccession: false,
    sameAsPrincipalInvestigator: false,
  });

  const formRef = useRef(null);
  const { id } = useParams();
  const dispatch = useDispatch();
  const textareaRef = useRef(null);
  const history = useHistory();
  const logAction = (action) => {
    setLogs((prevLogs) => ({
      ...prevLogs,
      [new Date().toString()]: {
        action,
        values,
      },
    }));
  };

  const formatETA = (seconds) => {
    if (seconds == null || Number.isNaN(seconds) || seconds < 0) return null;

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const fetchFileUploads = async () => {
    if (requestData && requestData.id) {
      try {
        const resp = await dispatch(listFileUploadsBySubmission(requestData.id));

        if (
          JSON.stringify(resp) === '{}' ||
          JSON.stringify(resp) === '[]' ||
          (resp.data && resp.data.length === 0)
        ) {
          return;
        }

        const error =
          resp?.data?.error ||
          resp?.error ||
          resp?.data?.[0]?.error;
        if (error) {
          if (
            !error.match(/not authorized/gi) &&
            !error.match(/not implemented/gi)
          ) {
            const str = `An error has occurred while getting the list of files: ${error}.`;
            return;
          } else {
            return;
          }
        }

        const files = resp?.data?.errorType ? [] : resp?.data || [];

        // Sort files based on lastModified
        files.sort((a, b) => {
          const keyA = new Date(a.lastModified);
          const keyB = new Date(b.lastModified);
          return keyB - keyA;
        });

        // Filter into categories for display
        const categoryFiles = {};
        files.forEach((f) => {
          if (f.category in categoryFiles) {
            categoryFiles[f.category].push(f);
          } else {
            categoryFiles[f.category] = [f];
          }
        });

        // Set the files in state
        setUploadedFiles(categoryFiles);

        // -----------------------------------------------------
        // Polling logic
        // -----------------------------------------------------
        const activeFiles = files.filter(
          f => f.status && !['failed', 'distributed'].includes(f.status.toLowerCase())
        );

        if (activeFiles.length === 0) {
          if (pollTimer) {
            clearInterval(pollTimer); // Stop polling immediately
            pollTimer = null;
          }
          return; // Exit without starting polling
        }

        const latest = activeFiles.reduce((a, b) =>
          new Date(a.lastModified) > new Date(b.lastModified) ? a : b
        );

        const lastModifiedTime = new Date(latest.lastModified).getTime();
        const now = Date.now();
        const within7Minutes = now - lastModifiedTime < 7 * 60 * 1000; // 7 min

        if (within7Minutes) {
          console.log('Detected active files — starting polling for 7 minutes');
          startPolling();
        } else {
          console.log('No polling needed');
        }

      } catch (error) {
        console.error('Failed to fetch file uploads:', error);
      }
    }
    setUploadFileFlag(false);
  };

  let pollTimer = null;

  const startPolling = () => {
    // Clear any previous polling timer to prevent multiple timers
    if (pollTimer) clearInterval(pollTimer);

    const start = Date.now();

    pollTimer = setInterval(async () => {
      const elapsed = Date.now() - start;

      // Stop polling after 7 minutes
      if (elapsed > 7 * 60 * 1000) {
        clearInterval(pollTimer);
        pollTimer = null;
        console.log('Polling stopped (7-minute timeout)');
        return;
      }

      console.log('Polling fetchFileUploads...');
      await fetchFileUploads();

    }, 30 * 1000); // Poll every 30 seconds
  };


  useEffect(() => {
    fetchFileUploads();
  }, [requestData, uploadFileFlag]);

  useEffect(() => {
    if (formData) {
      if (formData.error){
        setAlertVariant('danger');
        setAlertMessage(
          'Unable to fetch form data. If you believe this is an error please contact the EDPub team.'
        );
        setDismissCountDown(10);
        return;
      }
      setQuestions(formData.sections);
      const initialValues = {};
      formData.sections.forEach((section) => {
        section.questions.forEach((question) => {
          question.inputs.forEach((input) => {
            initialValues[input.control_id] =
              input.type === 'checkbox' ? false : '';
          });
        });
      });

      if (requestData && requestData.form_data) {
        Object.keys(requestData.form_data).forEach((key) => {
          if (initialValues.hasOwnProperty(key)) {
            initialValues[key] = requestData.form_data[key];
          } else {
            if (key === 'same_as_poc_name_data_producer_info_name') {
              initialValues[key] = requestData.form_data[key];
              setCheckboxStatus((prev) => ({
                ...prev,
                sameAsPrimaryDataProducer: requestData.form_data[key],
              }));
            } else if (key === 'same_as_long_term_support_poc_name_poc_name') {
              initialValues[key] = requestData.form_data[key];
              setCheckboxStatus((prev) => ({
                ...prev,
                sameAsPrimaryDataAccession: requestData.form_data[key],
              }));
            } else if (
              key === 'same_as_long_term_support_poc_name_data_producer_info_name'
            ) {
              initialValues[key] = requestData.form_data[key];
              setCheckboxStatus((prev) => ({
                ...prev,
                sameAsPrimaryLongTermSupport: requestData.form_data[key],
              }));
            } else if (
              key === 'dar_form_same_as_principal_investigator'
            ) {
              initialValues[key] = requestData.form_data[key];
              setCheckboxStatus((prev) => ({
                ...prev,
                sameAsPrincipalInvestigator: requestData.form_data[key],
              }));
            } else if (key && typeof requestData.form_data[key] !== 'object') {
              initialValues[key] = requestData.form_data[key];
            }
          }
        });
      }

      formData.sections.forEach((section) => {
        section.questions.forEach((question) => {
          question.inputs.forEach((input) => {
            if (input.type === 'table' && input.enums) {
              const defaultRow = {};
              input.enums.forEach((enumItem) => {
                defaultRow[enumItem.key] = '';
              });
              if (
                !initialValues[input.control_id] ||
                initialValues[input.control_id].length === 0
              ) {
                initialValues[input.control_id] = [defaultRow];
              }
            }
          });
        });
      });

      setValues({ ...initialValues, validation_errors: {} });
    }

    if (requestData) {
      setDaacData(requestData);
    }
  }, [formData, requestData]);

  useEffect(() => {
    [
      'poc_name',
      'poc_organization',
      'poc_department',
      'poc_email',
      'poc_orcid',
    ].forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.disabled = checkboxStatus.sameAsPrimaryDataProducer;
      }
    });

    [
      'long_term_support_poc_name',
      'long_term_support_poc_organization',
      'long_term_support_poc_department',
      'long_term_support_poc_email',
      'long_term_support_poc_orcid',
    ].forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.disabled =
          checkboxStatus.sameAsPrimaryLongTermSupport ||
          checkboxStatus.sameAsPrimaryDataAccession;
      }
    });

    [
      'dar_form_data_accession_poc_name',
      'dar_form_data_accession_poc_organization',
      'dar_form_data_accession_poc_email',
      'dar_form_data_accession_poc_orcid',
    ].forEach((fieldId) => {
      
      const field = document.getElementById(fieldId);
      if (field) {
        field.disabled = checkboxStatus.sameAsPrincipalInvestigator;
      }
    });
  }, [checkboxStatus]);

  useEffect(() => {
    if (dismissCountDown > 0) {
      const intervalId = setInterval(() => {
        setDismissCountDown((prevCount) => prevCount - 1);
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [dismissCountDown]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      saveFile('draft', false);
    }, 300000);

    return () => clearInterval(intervalId);
  }, [values]);

  const allowOnlyNumbers = (event) => {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  };

  const isFieldRequired = (input, parent) => {
    if (input.type === 'file') {
      return parent.required;
    }
    if (input.required_if && input.required_if.length === 0) {
      return input.required || false;
    }
    const result = input.required_if.some((condition) => {
      return (
        values[condition.field] ===
        (condition.value === 'true'
          ? true
          : condition.value === 'false'
          ? false
          : condition.value)
      );
    });

    return result;
  };

  const validateField = (controlId, value, long_name, parent) => {
    let errorMessage = '';
    const input = questions
      .flatMap((section) => section.questions)
      .flatMap((question) => question.inputs)
      .find((input) => input.control_id === controlId);

    if (input) {
      const fieldRequired = isFieldRequired(input, parent);

      if (
        fieldRequired &&
        (!value || value === '') &&
        input.type !== 'bbox' &&
        input.type !== 'table'
      ) {
        errorMessage = `${
          long_name ? long_name + ' - ' : ''
        }${input.label || long_name} is required`;
      } else if (
        fieldRequired &&
        input.type === 'number' &&
        isNaN(value)
      ) {
        errorMessage = `${input.label || long_name} must be a valid number`;
      } else if (
        fieldRequired &&
        input.type === 'email' &&
        !/\S+@\S+\.\S+/.test(value)
      ) {
        errorMessage = `${
          input.label || long_name
        } must be a valid email address`;
      } else if (
        fieldRequired &&
        input.type === 'datetimePicker' &&
        isNaN(new Date(value).getTime())
      ) {
        errorMessage = `${
          input.label || long_name
        } must be a valid date and time`;
      } else if (
        fieldRequired &&
        input.type === 'select' &&
        !input.options.includes(value)
      ) {
        errorMessage = `${input.label || long_name} must be a valid option`;
      } else if (
        fieldRequired &&
        input.type === 'radio' &&
        value &&
        !input.enums.includes(value)
      ) {
        errorMessage = `${
          long_name ? long_name + ' - ' : ''
        }${input.label || long_name} must be a valid option`;
      } else if (input.type === 'table') {
        if (value && value.length > 0) {
          value = value.filter((obj) => Object.keys(obj).length !== 0);
        }
        if(controlId && controlId.startsWith('assignment_')){
          const result =
          value && value.some((producer) => areAssignmentFieldsEmpty(producer));
          if (result || (value && value.length === 0)) {
          errorMessage = `${
            input.label && input.label !== 'undefined'
              ? input.label
              : long_name
          } all fields are required`;
          }
        }else {
          if (sectionHeader === 'Data Evaluation Request') {
             const result = value && value.some((producer) => areProductFieldsEmpty(producer));
            if (result || (value && value.length === 0)) {
              errorMessage = `${
                input.label && input.label !== 'undefined'
                  ? input.label
                  : long_name
              } fill out all the required fileds in the form`;
            }
          } else if (sectionHeader === 'Data Accession Request') {
              const result = value && value.some((producer) => areProducerFieldsEmpty(producer));
              if (result || (value && value.length === 0)) {
                errorMessage = `${
                  input.label && input.label !== 'undefined'
                    ? input.label
                    : long_name
                } fill out all the fields in the table`;
              }
          }
          else {
            const result = value && value.some((producer) => areProducersEmpty(producer));
            if (result || (value && value.length === 0)) {
              errorMessage = `${
                input.label && input.label !== 'undefined'
                  ? input.label
                  : long_name
              } fill out all the fields in the table`;
            }
          }
        }
      } else if (input.type === 'bbox') {
        const directions = ['north', 'east', 'south', 'west'];
        const lst = [];
        for (let direction of directions) {
          const bboxError = getBboxError(controlId, direction, input);
          if (bboxError) {
            errorMessage = bboxError;
            let controlId2 = `${controlId}_${direction}`;
            lst.push({ errorMessage: errorMessage, controlId: controlId2 });
          }
        }
        return lst;
      }
      if (controlId === 'product_temporal_coverage_end') {
        const startDate = new Date(values['product_temporal_coverage_start']);
        const endDate = new Date(value);
        if (startDate && endDate && startDate >= endDate) {
          errorMessage = 'End Date and Time must be greater than Start Date and Time';
        }
      }
    }
    return [errorMessage, controlId];
  };

  const getBboxError = (control_id, direction, input) => {
    let label = `${direction.substring(0, 1).toUpperCase()}`;

    if (values[`${control_id}_${direction}`]) {
      if (isNaN(values[`${control_id}_${direction}`])) {
        return 'Must be a number';
      }
      let this_val = parseFloat(values[`${control_id}_${direction}`]);
      let comp_direction = {
        south: 'north',
        west: 'east',
      };
      let comp_val = parseFloat(
        values[`${control_id}_${comp_direction[direction]}`]
      );

      if (/west|south/.test(direction) && this_val > comp_val) {
        return `Spatial Information - Data Product Horizontal Spatial Coverage - ${label}: ${label} must be less than ${comp_direction[
          direction
        ]
          .substring(0, 1)
          .toUpperCase()}`;
      }
      if (direction === 'west' && this_val >= 180.0) {
        return `Spatial Information - Data Product Horizontal Spatial Coverage - ${label}: ${label} must be less than 180.0`;
      }
      if (direction === 'east' && this_val <= -180.0) {
        return `Spatial Information - Data Product Horizontal Spatial Coverage - ${label}: ${label} must be greater than -180.0`;
      }
      if (direction === 'south' && this_val >= 90.0) {
        return `Spatial Information - Data Product Horizontal Spatial Coverage - ${label}: ${label} must be less than 90.0`;
      }
      if (direction === 'north' && this_val <= -90.0) {
        return `Spatial Information - Data Product Horizontal Spatial Coverage - ${label}: ${label} must be greater than -90.0`;
      }
      if (direction === 'west' && this_val < -180.0) {
        return `Spatial Information - Data Product Horizontal Spatial Coverage - ${label}: ${label} is out of range. ${label} must be greater than -180.0`;
      }
      if (direction === 'east' && this_val > 180.0) {
        return `Spatial Information - Data Product Horizontal Spatial Coverage - ${label}: ${label} is out of range. ${label} must be less than 180.0`;
      }
      if (direction === 'south' && this_val < -90.0) {
        return `Spatial Information - Data Product Horizontal Spatial Coverage - ${label}: ${label} is out of range. ${label} must be greater than -90.0`;
      }
      if (direction === 'north' && this_val > 90.0) {
        return `Spatial Information - Data Product Horizontal Spatial Coverage - ${label}: ${label} is out of range. ${label} must be less than 90.0`;
      }
    }
    return !values[`${control_id}_${direction}`] && input.required
      ? `Spatial Information - Data Product Horizontal Spatial Coverage - ${label}:  is required`
      : undefined;
  };

  const areProducerFieldsEmpty = (producer) => {
    if (!producer) return true;

    const requiredFields = [
      "data_product_name",
      "data_prod_timeline",
      "data_prod_volume",
      "instrument_collect_data",
    ];

    return requiredFields.some((field) => !producer[field]?.trim());
  };

  const areProducersEmpty = (producer) => {
    if (!producer) return true;

    const requiredFields = [
      "producer_first_name",
      "producer_middle_initial",
      "producer_last_name_or_organization",
    ];

    return requiredFields.some((field) => !producer[field]?.trim());
  };

const areProductFieldsEmpty = (producer) => {
  if (!producer) return true;

  const requiredFields = [
    "data_product_name",
    "data_prod_timeline",
    "data_prod_volume",
    "instrument_collect_data",
    "data_prod_doi",
    "data_prod_grid",
    "data_prod_file_format",
    "data_prod_granule",
    "data_prod_params",
    "data_prod_temporal_coverage",
    "data_prod_spatial_coverage",
    "data_prod_ingest_frequency",
  ];

  return requiredFields.some((field) => !producer[field] || producer[field].toString().trim() === "");
};

  
  const areAssignmentFieldsEmpty = (producer) => {
    return (
      producer.data_product_name === '' ||
      producer.data_prod_timeline === '' ||
      producer.data_prod_volume === '' ||
      producer.instrument_collect_data === ''
    );
  }

  const validateRequiredGroup = (question, fieldName, values, newValidationErrors, errorOrder) => {
    const isTargetField = question.long_name === fieldName;
    const isEmpty = question.inputs.filter(input => values[input.control_id]).length === 0;

    if (isTargetField && isEmpty) {
      const lastControlId = question.inputs?.[question.inputs.length - 1]?.control_id || null;
      if (lastControlId) {
        newValidationErrors[lastControlId] = `${fieldName} is required`;
        errorOrder.push(lastControlId);
      }
    }
  };

  const validateFields = (checkAllFields = true, jsonObj) => {

    const newValidationErrors = {};
    const errorOrder = [];
    questions.forEach((section) => {
      section.questions.forEach((question) => {
      validateRequiredGroup(question, 'Funding Organization', values, newValidationErrors, errorOrder);
      validateRequiredGroup(question, 'Data Format', values, newValidationErrors, errorOrder);
      question.inputs.forEach((input) => {
        const value = jsonObj.data && jsonObj.data[input.control_id];
        if (checkAllFields || value) {
          if (input.type === 'bbox') {
            const errorMessage = validateField(
              input.control_id,
              'direction',
              question.long_name,
              ''
            );
            for (const element of errorMessage) {
              newValidationErrors[element.controlId] = element.errorMessage;
              errorOrder.push(element.controlId);
            }
          } else if (input.type === 'file') {
            if (uploadedFiles && typeof category_map[input.control_id] !== 'undefined' &&
              (!(category_map[input.control_id] in uploadedFiles) ||
              (category_map[input.control_id] in uploadedFiles &&
              uploadedFiles[category_map[input.control_id]].length === 0))) {
              let flag;
              question.inputs.forEach((input) => {
                if (jsonObj.data[input.control_id]) {
                  flag = true;
                  return;
                }
              });
              const [errorMessage, fieldId] = validateField(
                input.control_id,
                flag,
                question.long_name,
                question
              );
              if (errorMessage) {
                newValidationErrors[fieldId] = errorMessage;
                errorOrder.push(input.control_id);
              }
            }
          } else {
            const [errorMessage, fieldId] = validateField(
              input.control_id,
              value,
              question.long_name,
              question
            );
            if (errorMessage) {
              newValidationErrors[fieldId] = errorMessage;
              if(input.type === 'radio' || input.type === 'table'){
                errorOrder.push(input.control_id+'_group');
              }else {
                errorOrder.push(input.control_id);
              }
            }
          }
        }
      });
    });
  });

  setValues((prev) => {
    const isEmpty = Object.entries(newValidationErrors).length === 0;

    // Construct the updated object dynamically
    const updatedValues = { ...prev };

    if (!isEmpty) {
      updatedValues.validation_errors = newValidationErrors;
    }
    console.log('Validation Errors', newValidationErrors);
    return updatedValues;
  });

  if (errorOrder.length > 0) {
    const firstInvalidFieldId = errorOrder[0];
    const elList = document.querySelectorAll(`[id="${firstInvalidFieldId}"]`);
    const el = [...elList].find(el => el.type !== 'checkbox');
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus?.();
      }, 100);
    } else {
      console.warn('Could not scroll to:', firstInvalidFieldId);
    }
  }
  return Object.keys(newValidationErrors).length === 0;
};

  const handleFieldChange = (controlId, value) => {
    setValues((prevValues) => {
      const newValues = {
        ...prevValues,
        [controlId]: value,
        validation_errors: { ...prevValues.validation_errors },
      };

      if (sectionHeader !== 'Data Publication Request' && checkboxStatus.sameAsPrincipalInvestigator) {
        const piToPocMap = {
          dar_form_principal_investigator_fullname: "dar_form_data_accession_poc_name",
          dar_form_principal_investigator_organization: "dar_form_data_accession_poc_organization",
          dar_form_principal_investigator_email: "dar_form_data_accession_poc_email",
          dar_form_principal_investigator_orcid: "dar_form_data_accession_poc_orcid",
        };

        if (piToPocMap[controlId]) {
          newValues[piToPocMap[controlId]] = value;
        }
      }

      if (
        checkboxStatus.sameAsPrimaryDataProducer &&
        controlId.startsWith('data_producer_info_')
      ) {
        const updatedField = controlId.replace('data_producer_info_', 'poc_');
        newValues[updatedField] = value;
      }

      if (
        checkboxStatus.sameAsPrimaryLongTermSupport &&
        controlId.startsWith('data_producer_info_')
      ) {
        const updatedField = controlId.replace(
          'data_producer_info_',
          'long_term_support_poc_'
        );
        newValues[updatedField] = value;
      }

      if (
        checkboxStatus.sameAsPrimaryDataAccession &&
        controlId.startsWith('poc_')
      ) {
        const updatedField = controlId.replace('poc_', 'long_term_support_poc_');
        newValues[updatedField] = value;
      }

      saveToHistory(newValues);
      return newValues;
    });

    if (
      checkboxStatus.sameAsPrimaryDataProducer &&
      controlId.startsWith('data_producer_info_')
    ) {
      const updatedField = controlId.replace('data_producer_info_', 'poc_');
      delete values.validation_errors[updatedField];
    }

    if (
      checkboxStatus.sameAsPrimaryLongTermSupport &&
      controlId.startsWith('data_producer_info_')
    ) {
      const updatedField = controlId.replace(
        'data_producer_info_',
        'long_term_support_poc_'
      );
      delete values.validation_errors[updatedField];
    }

    if (
      checkboxStatus.sameAsPrimaryDataAccession &&
      controlId.startsWith('poc_')
    ) {
      const updatedField = controlId.replace('poc_', 'long_term_support_poc_');
      delete values.validation_errors[updatedField];
    }

    if (controlId.startsWith('example_file')) {
      // not good but I have hardcoded. Need to find workaround!!
      delete values.validation_errors['example_files'];
    }

    if (!value || value === '' && values.validation_errors[controlId]) {
      handleInvalid({
        target: {
          name: controlId,
          validationMessage: `${controlId} is required`,
        },
      });
    } else {
      handleInvalid({
        target: { name: controlId, validationMessage: '' },
      });
    }
  };

 const handleTableFieldChange = (controlId, rowIndex, key, value) => {
  setValues(prevValues => {
    const updatedTable = [...(prevValues[controlId] || [])];
    const updatedRow = { ...updatedTable[rowIndex] };
    updatedRow[key] = value;
    updatedTable[rowIndex] = updatedRow;

    const newValues = {
      ...prevValues,
      [controlId]: updatedTable,
    };

    // also update history here
    saveToHistory(newValues);

    return newValues;
  });
  handleInvalid({ target: { name: controlId, validationMessage: '' } });
};


  const handleInvalid = (evt) => {
    const { name, validationMessage } = evt.target;
    const errorElement = document.getElementById(`${name}_invalid`);

    if (errorElement) {
      errorElement.textContent = validationMessage;
      errorElement.classList.toggle('hidden', !validationMessage);
    }

    if (validationMessage) {
      setValues((prev) => ({
        ...prev,
        validation_errors: {
          ...prev.validation_errors,
          [name]: validationMessage,
        },
      }));
    } else {
      setValues((prev) => {
        const newValidationErrors = { ...prev.validation_errors };
        delete newValidationErrors[name];
        return { ...prev, validation_errors: newValidationErrors };
      });
    }
  };

  const getErrorMessage = (input, question, sectionHeading) => {
    return values.validation_errors && values.validation_errors[input.control_id]
      ? sectionHeading + ' - ' + values.validation_errors[input.control_id]
      : '';
  };

  const isError = (input) =>
    values.validation_errors && values.validation_errors[input.control_id];

  const { basepath } = _config;

  const urlReturn = `${basepath}requests`;

  const submitForm = (e) => {
    e.preventDefault();
    logAction('Submit');
    setValidationAttempted(true);
    saveFile('submit', false);
  };

  const cancelForm = () => {
    setShowCancelModal(true); 
  };

  const draftFile = (e) => {
    e.preventDefault();
    logAction('Save as draft');
    saveFile('draft', true);
  };

  const filterEmptyObjects = (k, array) => {
    return array.filter((obj) => {
      if (!obj || typeof obj !== 'object') {
        return false;
      }

      if(k.startsWith('assignment_')) return Object.values(obj).some(value => value !== '');

      const keys = Object.keys(obj);
      if (keys.length < 2) {
        return true;
      }

      const firstKey = keys[0];
      const lastKey = keys[keys.length - 1];

      return obj[firstKey] !== '' || obj[lastKey] !== '';
    });
  };

  const processAndStringifyValues = (jsonObject) => {
    const result = {};

    for (const key in jsonObject) {
      if (jsonObject.hasOwnProperty(key)) {
        const value = jsonObject[key];
        // Skip keys with `false` values
        if (value !== false && !Array.isArray(value)) {
          // Convert the value to a string
          result[key] = String(value);
        } else if (Array.isArray(value)) {
          result[key] = value;
        }
      }
    }
    return result;
  };

  const saveFile = async (type, modelStatus) => {
    const fieldValues = { ...values };
    let jsonObject = {
      data: {},
      log: {},
      versions: {},
      form_id: daacInfo.step_data && daacInfo.step_data.form_id,
      id: daacInfo.id,
      daac_id: daacInfo.daac_id,
    };

    Object.keys(fieldValues).forEach((key) => {
      if (Array.isArray(fieldValues[key])) {
        jsonObject.data[key] = filterEmptyObjects(key, fieldValues[key]);
      } else if (fieldValues[key] !== '') {
        jsonObject.data[key] = fieldValues[key];
      }
    });

    const processedData = processAndStringifyValues(jsonObject.data);
    jsonObject.log = logs;
    jsonObject.data = processedData;

    if (type === 'continueEditing') {
      setValidationAttempted(true);
      validateFields(true, jsonObject);
      if (jsonObject.data && jsonObject.data.validation_errors) {
        delete jsonObject.data.validation_errors;
      }
      await dispatch(saveForm(jsonObject));
      setAlertVariant('success');
      setAlertMessage('Your request has been saved.');
      setDismissCountDown(10);
      return;
    }

    if (type === 'draft') {
      setValidationAttempted(false);
      validateFields(false, jsonObject);
      setAlertVariant('success');
      setAlertMessage('Saving the form as draft');
      setDismissCountDown(1);
      try {
        if (jsonObject.data && jsonObject.data.validation_errors) {
          delete jsonObject.data.validation_errors;
        }

        const resp = await dispatch(saveForm(jsonObject));
        const error =
          resp?.data?.error || resp?.error || resp?.data?.[0]?.error;
        if (error) {
          setAlertVariant('danger');
          setAlertMessage('Failed to Save the form as draft');
          console.error('Failed to Save the form as draft:', error);
          setDismissCountDown(5);
        } else if (resp && resp.data && modelStatus) {
          setShowModal(true);
        }
      } catch (error) {
        console.error('Failed to Save the form as draft:', error);
      }
      return;
    }

    if (type === 'submit') {
      if (validateFields(true, jsonObject)) {
        if (jsonObject.data && jsonObject.data.validation_errors) {
          delete jsonObject.data.validation_errors;
        }
        await dispatch(submitFilledForm(jsonObject));
        window.location.href = urlReturn;
      } else {
        setAlertVariant('danger');
        setAlertMessage(
          'You have errors to correct before you can submit your request. You can save your request as a draft and come back.'
        );
        setDismissCountDown(5);
      }
    }
  };

  const resetUploads = (alertMsg, statusMsg, controlId) => {
    if (alertMsg) {
      setAlertVariant('danger');
      setAlertMessage(alertMsg);
      setDismissCountDown(7);
    }
    setUploadStatusMsg(statusMsg);
    formRef.current.reset();
  };

  const saveToHistory = (newValues) => {
    const history = valueHistory.slice(0, valueHistoryUndoIdx + 1);
    setValueHistory([...history, { ...newValues, validation_errors: newValues.validation_errors || {} }]);
    setValueHistoryUndoIdx(history.length);
  };

  const redoToPreviousState = () => {
    if (valueHistoryUndoIdx < valueHistory.length - 1) {
      setValueHistoryUndoIdx(valueHistoryUndoIdx + 1);
      setValues((prevValues) => ({
        ...valueHistory[valueHistoryUndoIdx + 1],
        validation_errors: valueHistory[valueHistoryUndoIdx + 1].validation_errors || {},
      }));
    }
    logAction('Redo');
  };

  const undoToPreviousState = () => {
    if (valueHistoryUndoIdx > 0) {
      const previousState = valueHistory[valueHistoryUndoIdx - 1]; 
        setValueHistoryUndoIdx(valueHistoryUndoIdx - 1);
        setValues((prevValues) => ({
            ...prevValues, 
            ...previousState, 
            validation_errors: previousState.validation_errors || {}, 
        }));
    }
    logAction('Undo');
  };

  const resize = (textarea) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const showIf = (config) => {
    if (!Array.isArray(config) || config.length === 0) {
      return true;
    }
    for (let fld of config) {
      if (values[fld.field] && values[fld.field].toString() === fld.value.toString()) {
        return true;
      }
    }
    return false;
  };

  const clearProducerData = (producerList) => {
    if (producerList.length === 0) return {};

    const keys = Object.keys(producerList[0]);
    const emptyProducer = {};

    keys.forEach((key) => {
      emptyProducer[key] = '';
    });

    return emptyProducer;
  };

  const addRow = (tableId, row = {}) => {
    const updatedTable = [...(values[tableId] || []), row];
    setValues((prevValues) => {
      const newValues = { ...prevValues, [tableId]: updatedTable };
      saveToHistory(newValues);
      return newValues;
    });
    logAction('Add Row');
  };

  const removeRow = (tableId, rowIndex) => {
    const updatedTable = [...(values[tableId] || [])];
    updatedTable.splice(rowIndex, 1);
    setValues((prevValues) => {
      const newValues = { ...prevValues, [tableId]: updatedTable };
      saveToHistory(newValues);
      return newValues;
    });
    logAction('Remove Row');
  };

  const moveUpDown = (tableId, rowIndex, direction) => {
    const updatedTable = [...(values[tableId] || [])];
    if (direction === 'up' && rowIndex > 0) {
      [updatedTable[rowIndex], updatedTable[rowIndex - 1]] = [
        updatedTable[rowIndex - 1],
        updatedTable[rowIndex],
      ];
    }
    if (direction === 'down' && rowIndex < updatedTable.length - 1) {
      [updatedTable[rowIndex], updatedTable[rowIndex + 1]] = [
        updatedTable[rowIndex + 1],
        updatedTable[rowIndex],
      ];
    }
    setValues((prevValues) => {
      const newValues = { ...prevValues, [tableId]: updatedTable };
      saveToHistory(newValues);
      return newValues;
    });
    logAction('Move Row');
  };

  const checkRequiredIf = (input) => {
    if (!input.required_if || !Array.isArray(input.required_if) || input.required_if.length === 0) {
      return false;
    }
    for (let req_if of input.required_if) {
      if (values[req_if.field] && values[req_if.field].toString() === req_if.value.toString()) {
        return true;
      }
    }
    return false;
  };

  const getAttribute = (attr, input) => {
    return input.attributes ? input.attributes[attr] : undefined;
  };

  const charactersRemaining = (value, maxlength) => {
    return maxlength ? maxlength - (value ? value.length : 0) : undefined;
  };

  const validateFile = (file) => {
    let valid = false;
    let msg = '';
    if (file.name.match(/\.([^.]+)$/) !== null) {
      var ext = file.name.match(/\.([^.]+)$/)[1];
      if (ext.match(/exe/gi)) {
        msg = 'exe is an invalid file type.';
        resetUploads(msg, 'Please select a different file.');
      } else {
        valid = true;
      }
    } else {
      msg = 'The file must have an extension.';
      resetUploads(msg, 'Please select a different file.');
    }
    return valid;
  };

  const handleFileDrop = (e, id) => {
    setfileControlId(id);
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length) {
      if(fileControlId === id){
        setUploadFiles([...uploadFiles, ...Array.from(files)]); 
      }else{
        setUploadFiles(Array.from(files)); 
      }
      setUploadFile(files);
      setUploadStatusMsg(`${files.length} file(s) selected`);
    } else {
      setUploadStatusMsg('No files selected');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileChange = (event, id) => {
    setfileControlId(id);
    const files = event.target.files;
    if (files.length) {
      if(fileControlId === id){
        setUploadFiles([...uploadFiles, ...Array.from(files)]);
      }else{
        setUploadFiles(Array.from(files)); 
      }
      setUploadFile(files);
      setUploadStatusMsg(`${files.length} file(s) selected`);
    } else {
      setUploadStatusMsg('No files selected');
    }
    event.target.value = null;
  };

  const { apiRoot, useCUEUpload } = _config;
  const [uploadResults, setUploadResults] = useState({ success: [], failed: [] });
  const [showUploadSummaryModal, setShowUploadSummaryModal] = useState(false);
  const [progressBarsVisible, setProgressBarsVisible] = useState(true);
  const [uploadProgress, setUploadProgress] = useState({});

  const category_map = {
    "data_product_documentation": "documentation",
    "dar_form_project_documentation": "documentation",
    "example_files": "sample"
  };

  const handleUpload = async (control_id) => {
    setUploadStatusMsg('Uploading...');
    setUploadFlag(true);
    const successFiles = [];
    const failedFiles = [];

    const uploadFileAsync = async (file) => {
      return new Promise((resolve, reject) => {

        const updateProgress = (progress, fileObj) => {
          // console.log('progress',progress);
          // console.log('fileObj', fileObj);
          setUploadProgress((prev) => ({
            ...prev,
            [fileObj.name]: {
              percent: progress.percent,
              etaSeconds: progress.etaSeconds,
              phase: progress.phase
            }
          }));
        };

        let uploadCategory = typeof category_map[control_id] !== 'undefined' ? category_map[control_id] : "";
        const payload = {
          fileObj: file,
          authToken: localStorage.getItem('auth-token'),
          apiEndpoint: `${apiRoot}data/upload/getPostUrl`,
          submissionId: daacInfo.id, 
          endpointParams: {
            file_category: uploadCategory
          }
        };

        const upload = (useCUEUpload?.toLowerCase?.() === 'false' ? new LocalUpload() : new CueFileUtility());
        upload.uploadFile(payload, updateProgress)
          .then(async (resp) => {
            const error =
              resp?.data?.error ||
              resp?.error ||
              resp?.data?.[0]?.error;

            if (error) {
              console.error(`Error uploading file ${file.name}: ${error}`);

              setUploadProgress((prev) => ({
                ...prev,
                [file.name]: {
                  percent: prev[file.name]?.percent ?? 0,
                  etaSeconds: null,
                  phase: 'failed',
                },
              }));

              reject({
                fileName: file.name,
                error: error || 'Upload failed due to an unknown error',
              });

              return;
            }

            // Only runs on successful upload
            const tempPayload = {
              fileId: resp.file_id,
              submissionId: daacInfo.id,
            };

            await dispatch(createTempUploadFile(tempPayload));
            resolve(file.name);
          })
          .catch((err) => {
            console.error(`Error uploading file ${file.name}: ${err}`);

            setUploadProgress((prev) => ({
              ...prev,
              [file.name]: {
                percent: prev[file.name]?.percent ?? 0,
                etaSeconds: null,
                phase: 'failed',
              },
            }));

            reject({
              fileName: file.name,
              error: err?.message || 'Network or server error during upload',
            });
          });

      });
    };

    const uploadPromises = uploadFiles.map((file) => {
      if (validateFile(file)) { 
        return uploadFileAsync(file)
          .then((fileName) => successFiles.push(fileName))
          .catch((fileName) => failedFiles.push(fileName));
      } else {
        failedFiles.push(file.name); 
        return Promise.resolve(); 
      }
    });    

    await Promise.all(uploadPromises);

    setUploadResults({ success: successFiles, failed: failedFiles });
    setUploadFlag(false);
    setUploadStatusMsg('Upload Complete');
    setTimeout(() => setUploadProgress({}), 1500);
    setUploadFileFlag(prev => !prev);
    setShowUploadSummaryModal(true);
    setUploadFiles([]); 
    setUploadStatusMsg('No files selected');
  };

  const toggleProgressBars = () => {
    setProgressBarsVisible(!progressBarsVisible);
  };

  const handleCloseUploadSummaryModal = () => setShowUploadSummaryModal(false);

  const handleCloseModal = () => setShowModal(false);

  const handleRedirect = () => {
    window.location.href = urlReturn;
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    if (name === 'sameAsPrimaryDataProducer') {
      setCheckboxStatus((prev) => ({ ...prev, [name]: checked }));

      setValues((prevValues) => {
        const updatedValues = {
          ...prevValues,
          same_as_poc_name_data_producer_info_name: checked,
          poc_name: prevValues.data_producer_info_name,
          poc_organization: prevValues.data_producer_info_organization,
          poc_department: prevValues.data_producer_info_department,
          poc_email: prevValues.data_producer_info_email,
          poc_orcid: prevValues.data_producer_info_orcid,
        };

        // Clear previous validation errors for dependent fields
        const newValidationErrors = { ...prevValues.validation_errors };
        [
          'poc_name',
          'poc_organization',
          'poc_department',
          'poc_email',
          'poc_orcid',
        ].forEach((field) => {
          delete newValidationErrors[field];
        });

        // Propagate errors from primary data producer to dependent fields
        if (prevValues.validation_errors['data_producer_info_name']) {
          newValidationErrors['poc_name'] =
            prevValues.validation_errors['data_producer_info_name'];
        }

        return { ...updatedValues, validation_errors: newValidationErrors };
      });
    } else if (name === 'sameAsPrimaryLongTermSupport') {
      setCheckboxStatus((prev) => ({
        ...prev,
        [name]: checked,
        sameAsPrimaryDataAccession: checked
          ? false
          : prev.sameAsPrimaryDataAccession,
      }));

      setValues((prevValues) => {
        const updatedValues = {
          ...prevValues,
          same_as_long_term_support_poc_name_data_producer_info_name: checked,
          same_as_long_term_support_poc_name_poc_name: checked
            ? false
            : prevValues.same_as_long_term_support_poc_name_poc_name,
          long_term_support_poc_name: prevValues.data_producer_info_name,
          long_term_support_poc_organization:
            prevValues.data_producer_info_organization,
          long_term_support_poc_department:
            prevValues.data_producer_info_department,
          long_term_support_poc_email: prevValues.data_producer_info_email,
          long_term_support_poc_orcid: prevValues.data_producer_info_orcid,
        };

        // Clear previous validation errors for dependent fields
        const newValidationErrors = { ...prevValues.validation_errors };
        [
          'long_term_support_poc_name',
          'long_term_support_poc_organization',
          'long_term_support_poc_department',
          'long_term_support_poc_email',
          'long_term_support_poc_orcid',
        ].forEach((field) => {
          delete newValidationErrors[field];
        });

        // Propagate errors from primary data producer to dependent fields
        if (prevValues.validation_errors['data_producer_info_name']) {
          newValidationErrors['long_term_support_poc_name'] =
            prevValues.validation_errors['data_producer_info_name'];
        }

        return { ...updatedValues, validation_errors: newValidationErrors };
      });
    } else if (name === 'sameAsPrimaryDataAccession') {
      setCheckboxStatus((prev) => ({
        ...prev,
        [name]: checked,
        sameAsPrimaryLongTermSupport: checked
          ? false
          : prev.sameAsPrimaryLongTermSupport,
      }));

      setValues((prevValues) => {
        const updatedValues = {
          ...prevValues,
          same_as_long_term_support_poc_name_data_producer_info_name: checked
            ? false
            : prevValues.same_as_long_term_support_poc_name_data_producer_info_name,
          same_as_long_term_support_poc_name_poc_name: checked,
          long_term_support_poc_name: prevValues.poc_name,
          long_term_support_poc_organization: prevValues.poc_organization,
          long_term_support_poc_department: prevValues.poc_department,
          long_term_support_poc_email: prevValues.poc_email,
          long_term_support_poc_orcid: prevValues.poc_orcid,
        };

        // Clear previous validation errors for dependent fields
        const newValidationErrors = { ...prevValues.validation_errors };
        [
          'long_term_support_poc_name',
          'long_term_support_poc_organization',
          'long_term_support_poc_department',
          'long_term_support_poc_email',
          'long_term_support_poc_orcid',
        ].forEach((field) => {
          delete newValidationErrors[field];
        });

        // Propagate errors from `poc_name` to `long_term_support_poc_name`
        if (prevValues.validation_errors['poc_name']) {
          newValidationErrors['long_term_support_poc_name'] =
            prevValues.validation_errors['poc_name'];
        }

        return { ...updatedValues, validation_errors: newValidationErrors };
      });
    } else if (name === 'sameAsPrincipalInvestigator') {
      setCheckboxStatus((prev) => ({ ...prev, [name]: checked }));
      setValues((prevValues) => {
        const updatedValues = {
          ...prevValues,
          dar_form_same_as_principal_investigator: checked,
          dar_form_data_accession_poc_name: prevValues.dar_form_principal_investigator_fullname,
          dar_form_data_accession_poc_organization: prevValues.dar_form_principal_investigator_organization,
          dar_form_data_accession_poc_email: prevValues.dar_form_principal_investigator_email,
          dar_form_data_accession_poc_orcid: prevValues.dar_form_principal_investigator_orcid,
        };

        // Clear previous validation errors for dependent fields
        const newValidationErrors = { ...prevValues.validation_errors };
        [
          'dar_form_data_accession_poc_name',
          'dar_form_data_accession_poc_organization',
          'dar_form_data_accession_poc_email',
          'dar_form_data_accession_poc_orcid',
        ].forEach((field) => {
          delete newValidationErrors[field];
        });

        // Propagate errors from primary data producer to dependent fields
        if (prevValues.validation_errors['dar_form_principal_investigator_fullname']) {
          newValidationErrors['dar_form_data_accession_poc_name'] =
            prevValues.validation_errors['dar_form_principal_investigator_fullname'];
        }

        return { ...updatedValues, validation_errors: newValidationErrors };
      });
    }
  };

  const handleRemoveFile = (fileName) => {
    setUploadFiles(uploadFiles.filter(elem => elem.name !== fileName));
  };

  const cloneRequest = async () => {
    const name = JSON.parse(window.localStorage.getItem('auth-user')).name;
    const id = JSON.parse(window.localStorage.getItem('auth-user')).id;
    const payload = {
      id: requestData?.id,
      copy_context: `Copied from bulk actions button by ${name} (${id})`
    };
    await dispatch(copyRequest(payload));
    history.push('/requests');
  }

  const cloneRequestByField = async () => {
   history.push({
      pathname: `/forms/id/${formData?.id}`,
      search: `?requestId=${requestData?.id}`,
      state: {
        clone: true,
      },
    });
  };

  return !requestData ? (
    <Loading />
  ) : (
    <div role="main" className="questions-component">
      <Form
        ref={formRef}
        name="questions_form"
        id="questions_form"
        onSubmit={submitForm}
        onInvalid={handleInvalid}
        onChange={handleInvalid}
      >
        <div className="sticky-navbar">
          <div className="button_bar">
            <div
              align="left"
              className="left_button_bar"
              style={{ display: readonly ? 'none' : 'block' }}
            >
              <Button
                className={`button ${
                  valueHistory.length - valueHistoryUndoIdx <= 1
                    ? 'disabled'
                    : ''
                }`}
                disabled={valueHistory.length - valueHistoryUndoIdx <= 1}
                onClick={redoToPreviousState}
                aria-label="redo button"
              >
                <FontAwesomeIcon icon={faRedo} /> {redoLabel}
              </Button>
              <Button
                className={`button ${
                  valueHistoryUndoIdx <= 0 ? 'disabled' : ''
                }`}
                disabled={valueHistoryUndoIdx <= 0}
                onClick={undoToPreviousState}
                aria-label="undo button"
              >
                <FontAwesomeIcon icon={faUndo} /> {undoLabel}
              </Button>
            </div>
            <div
              align="right"
              className="right_button_bar"
              style={{ display: readonly ? 'none' : 'block' }}
            >
              <Button
                className="eui-btn--blue"
                disabled={Object.keys(values).length === 0}
                onClick={() => {
                  logAction('Save and continue editing');
                  saveFile('continueEditing', false);
                }}
                aria-label="save button"
              >
                {saveLabel}
              </Button>
              <Button
                className="eui-btn--blue"
                disabled={Object.keys(values).length === 0}
                onClick={draftFile}
                aria-label="draft button"
              >
                {draftLabel}
              </Button>
              {requestData?.workflow_id !== "3335970e-8a9b-481b-85b7-dfaaa3f5dbd9" && (
                <>
                  <Button
                    className="eui-btn--blue"
                    disabled={Object.keys(values).length === 0}
                    onClick={() => {
                      logAction('clone request');
                      saveFile('draft', false);
                      cloneRequest();
                    }}
                    aria-label="clone button"
                  >
                    {clone}
                  </Button>

                  <Button
                    className="eui-btn--blue"
                    disabled={Object.keys(values).length === 0}
                    onClick={() => {
                      logAction('cloneByField');
                      saveFile('draft', false);
                      cloneRequestByField();
                    }}
                    aria-label="save button"
                  >
                    {cloneByField}
                  </Button>
                </>
              )}
              <Button
                className="eui-btn--green"
                disabled={Object.keys(values).length === 0}
                aria-label="submit button"
                type="submit"
              >
                {submitLabel}
              </Button>
              <Button
                className="eui-btn--red"
                disabled={!showCancelButton}
                onClick={cancelForm}
                aria-label="cancel button"
              >
                {cancelLabel}
              </Button>
            </div>
          </div>
        </div>
        <Alert
          className="sticky-alert"
          show={dismissCountDown > 0}
          variant={alertVariant}
          dismissible
          onClose={() => setDismissCountDown(0)}
        >
          {alertMessage}
        </Alert>
        <Container name="questions_container" id="questions_container">
          <h3
            id="daac_selection"
            style={{
              display: daacInfo && daacInfo.daac_name && daacInfo.daac_name !== '' ? 'block' : 'none',
              textAlign: 'left',
            }}
          >
            DAAC Selected:{' '}
            <span
              className="daac_name"
            >
            {daacInfo.daac_name}
            </span>
          </h3>
          <section>
            {questions.map((section, a_key) => (
              <Row key={a_key} className="row-align">
                <li
                  className="eui-banner--danger same-as-html5"
                  style={{
                    display: (values[`section_${a_key}`] || {}).$error
                      ? 'block'
                      : 'none',
                  }}
                >
                  Section {section.heading} is required
                </li>
                <div
                  className={`w-100 form-section ${
                    (values[`section_${a_key}`] || {}).$error
                      ? 'form-section-error'
                      : ''
                  }`}
                  style={{
                    display: showIf(section.heading_show_if) ? 'block' : 'none',
                  }}
                >
                  <input
                    type="hidden"
                    id={`section_${a_key}`}
                    style={{ display: section.heading_required ? 'block' : 'none' }}
                  />
                  <h2 className="section-heading">{section.heading}</h2>
                  <div id={a_key} className="question_section w-100">
                    {section.questions.map((question, b_key) => (
                      <FormGroup
                        key={b_key}
                        className={`form-group-error ${
                          (values[`question_${a_key}_${b_key}`] || {}).$error
                            ? 'form-group-error'
                            : ''
                        }`}
                        size="lg"
                        lg={12}
                        disabled={disabled}
                        readOnly={readonly}
                        style={{
                          display: showIf(question.show_if) ? 'block' : 'none',
                        }}
                      >
                        <legend className="hidden">
                          Fill out the form input fields.
                        </legend>
                        <input
                          type="hidden"
                          id={`question_${a_key}_${b_key}`}
                          style={{ display: question.required ? 'block' : 'none' }}
                          aria-label="Question Required Message"
                        />
                        <h3
                          className="sub-section-heading"
                          htmlFor={question.short_name}
                        >
                          {question.long_name}:{' '}
                          <span
                            className="small"
                            id={question.short_name || a_key}
                          >
                            {question.text}
                          </span>
                          <span
                            className="col text-right section_required"
                            style={{ display: question.required ? 'inline' : 'none', marginLeft: '5px' }}
                          >
                            required
                          </span>
                        </h3>
                        <p
                          className="text-muted"
                          style={{
                            display:
                              question.help !== 'undefined' && question.help !== 'true' ? 'block' : 'none',
                          }}
                          dangerouslySetInnerHTML={{ __html: question.help }}
                        />
                        <div className="checkbox-group"
                          tabIndex="-1"
                          id={`${question.inputs?.[0]?.control_id || question.id || 'unknown'}_group`}>
                          {question.long_name === 'Data Evaluation Point of Contact' && sectionHeader === 'Data Publication Request' && (
                            <label className="checkbox-item">
                              Same as Primary Data Producer
                              <input
                                type="checkbox"
                                name="sameAsPrimaryDataProducer"
                                checked={checkboxStatus.sameAsPrimaryDataProducer}
                                onChange={handleCheckboxChange}
                              />
                              <span className="checkmark"></span>
                            </label>
                          )}
                          {question.long_name === 'Data Accession Point of Contact' && (
                            <label className="checkbox-item">
                              Same as Principal Investigator
                              <input
                                type="checkbox"
                                name="sameAsPrincipalInvestigator"
                                checked={checkboxStatus.sameAsPrincipalInvestigator}
                                onChange={handleCheckboxChange}
                              />
                              <span className="checkmark"></span>
                            </label>
                          )}
                          {question.long_name === 'Long-term Support Point of Contact' && (
                            <>
                              <>
                                <label className="checkbox-item">
                                  Same as Primary Data Producer
                                  <input
                                    type="checkbox"
                                    name="sameAsPrimaryLongTermSupport"
                                    checked={checkboxStatus.sameAsPrimaryLongTermSupport}
                                    onChange={handleCheckboxChange}
                                  />
                                  <span className="checkmark"></span>
                                </label>
                                <label className="checkbox-item">
                                  Same as Data Evaluation Point of Contact
                                  <input
                                    type="checkbox"
                                    name="sameAsPrimaryDataAccession"
                                    checked={checkboxStatus.sameAsPrimaryDataAccession}
                                    onChange={handleCheckboxChange}
                                  />
                                  <span className="checkmark"></span>
                                </label>
                              </>
                            </>
                          )}
                          <div
                            className={`radio-group ${
                              validationAttempted &&
                              (question.long_name === 'Data Format' || question.long_name === 'Funding Organization') &&
                              question.inputs.filter(
                                (input) => values[input.control_id]
                              ).length === 0
                                ? 'radio-group-error'
                                : ''
                            }`}
                          >
                            {question.inputs.map((input, c_key) => (
                              <label
                                key={input.control_id}
                                className="checkbox-item"
                                style={{
                                  display: input.type === 'checkbox' ? 'flex' : 'none',
                                  alignItems: 'center',
                                  marginRight: '15px',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  className={`form-checkbox ${
                                    isError(input) ? 'form-checkbox-error' : ''
                                  }`}
                                  id={input.control_id}
                                  name={input.control_id}
                                  value={values[input.control_id] || ''}
                                  checked={!!values[input.control_id]}
                                  uncheckedvalue="false"
                                  aria-label={input.label}
                                  disabled={
                                    disabled ||
                                    Boolean(getAttribute('disabled', question.inputs[c_key]))
                                  }
                                  onChange={(e) =>
                                    handleFieldChange(input.control_id, e.target.checked)
                                  }
                                />
                                <label
                                  htmlFor={input.control_id}
                                  style={{ marginLeft: '5px' }}
                                >
                                  {input.label}
                                </label>
                                <span className="checkmark"></span>
                                <span
                                  className="required"
                                  style={{
                                    display: input.required || checkRequiredIf(input)
                                      ? 'block'
                                      : 'none',
                                  }}
                                >
                                  required
                                </span>
                                {getErrorMessage(input, question, section.heading) && (
                                  <div className="validation">
                                    {getErrorMessage(input, question, section.heading)}
                                  </div>
                                )}
                              </label>
                            ))}
                          </div>
                        </div>
                        <Row className="row-align">
                          <Col lg={question.size || 16} className="question_size">
                            {question.inputs.map((input, c_key) => (
                              <span key={c_key}>
                                {input.type !== 'checkbox' && (
                                  <Row className="row-align">
                                    {showIf(input.show_if) && (
                                      <>
                                        <label
                                          htmlFor={
                                            input.control_id || `${input}_${c_key}`
                                          }
                                          className="eui-label"
                                         style={{
                                          display:
                                            input.label !== undefined &&
                                            input.label !== '' &&
                                            input.type !== 'checkbox' &&
                                            input.type !== 'bbox' &&
                                            input.type !== 'table'
                                              ? 'block'
                                              : 'none',
                                          fontSize: '15px',
                                        }}
                                        >
                                          {input.label}:
                                        </label>
                                        <span
                                          className="date_formats"
                                          style={{
                                            display:
                                              input.type === 'datetimePicker'
                                                ? 'block'
                                                : 'none',
                                          }}
                                        >
                                          Format:{' '}
                                          <span className="date_formats_required">
                                            YYYY-MM-DD hh:mm AM/PM
                                          </span>
                                        </span>
                                        <label
                                          style={{
                                            display:
                                              (input.type === 'textarea' ||
                                                input.type === 'text') &&
                                              parseInt(
                                                charactersRemaining(
                                                  values[input.control_id],
                                                  getAttribute(
                                                    'maxlength',
                                                    question.inputs[c_key]
                                                  )
                                                )
                                              ) >= 0
                                                ? 'block'
                                                : 'none',
                                          }}
                                        >
                                          {charactersRemaining(
                                            values[input.control_id],
                                            getAttribute(
                                              'maxlength',
                                              question.inputs[c_key]
                                            )
                                          )}{' '}
                                          characters left
                                        </label>
                                        {input.type === 'text' && (
                                          <>
                                            <FormControl
                                              className={`${
                                                isError(input)
                                                  ? 'form-input-error'
                                                  : ''
                                              }`}
                                              type="text"
                                              id={input.control_id}
                                              name={input.control_id}
                                              value={values[input.control_id] || ''}
                                              size="lg"
                                              aria-label={input.control_id}
                                              disabled={
                                                disabled ||
                                                Boolean(
                                                  getAttribute(
                                                    'disabled',
                                                    question.inputs[c_key]
                                                  )
                                                ) ||
                                                (checkboxStatus.sameAsPrimaryDataProducer &&
                                                  input.control_id.startsWith('poc_')) ||
                                                (checkboxStatus.sameAsPrimaryLongTermSupport &&
                                                  input.control_id.startsWith(
                                                    'long_term_support_poc_'
                                                  )) ||
                                                (checkboxStatus.sameAsPrimaryDataAccession &&
                                                  input.control_id.startsWith(
                                                    'long_term_support_poc_'
                                                  )) ||
                                                (checkboxStatus.sameAsPrincipalInvestigator &&
                                                  input.control_id.startsWith('dar_form_data_accession_poc_')) 
                                              }
                                              readOnly={
                                                readonly ||
                                                Boolean(
                                                  getAttribute(
                                                    'readonly',
                                                    question.inputs[c_key]
                                                  )
                                                ) ||
                                                (sectionHeader !== 'Data Publication Request' && checkboxStatus.sameAsPrimaryDataProducer &&
                                                  input.control_id.startsWith('poc_')) ||
                                                (checkboxStatus.sameAsPrimaryLongTermSupport &&
                                                  input.control_id.startsWith(
                                                    'long_term_support_poc_'
                                                  )) ||
                                                (checkboxStatus.sameAsPrimaryDataAccession &&
                                                  input.control_id.startsWith(
                                                    'long_term_support_poc_'
                                                  )) ||
                                                (sectionHeader !== 'Data Publication Request' && checkboxStatus.sameAsPrincipalInvestigator &&
                                                  input.control_id.startsWith('dar_form_data_accession_poc_')) 
                                              }
                                              pattern={getAttribute(
                                                'pattern',
                                                question.inputs[c_key]
                                              )}
                                              maxLength={getAttribute(
                                                'maxlength',
                                                question.inputs[c_key]
                                              )}
                                              minLength={getAttribute(
                                                'minlength',
                                                question.inputs[c_key]
                                              )}
                                              max={getAttribute(
                                                'max',
                                                question.inputs[c_key]
                                              )}
                                              min={getAttribute(
                                                'min',
                                                question.inputs[c_key]
                                              )}
                                              placeholder={
                                                input.required || checkRequiredIf(input)
                                                  ? 'required'
                                                  : ''
                                              }
                                              onChange={(e) =>
                                                handleFieldChange(
                                                  input.control_id,
                                                  e.target.value
                                                )
                                              }
                                            />
                                            <p
                                              id={`${input.control_id}_invalid`}
                                              className="eui-banner--danger hidden form-control validation"
                                            >
                                              {getErrorMessage(
                                                input,
                                                question,
                                                section.heading
                                              )}
                                            </p>
                                          </>
                                        )}
                                        {input.type === 'email' && (
                                          <FormControl
                                            className={`${
                                              isError(input)
                                                ? 'form-input-error'
                                                : ''
                                            }`}
                                            type="text"
                                            id={input.control_id}
                                            name={input.control_id}
                                            value={values[input.control_id] || ''}
                                            size="lg"
                                            aria-label={input.control_id}
                                            disabled={
                                              disabled ||
                                              Boolean(
                                                getAttribute(
                                                  'disabled',
                                                  question.inputs[c_key]
                                                )
                                              ) ||
                                              (sectionHeader === 'Data Publication Request' && checkboxStatus.sameAsPrimaryDataProducer &&
                                                input.control_id.startsWith('poc_')) ||
                                              (checkboxStatus.sameAsPrimaryLongTermSupport &&
                                                input.control_id.startsWith(
                                                  'long_term_support_poc_'
                                                )) ||
                                              (checkboxStatus.sameAsPrimaryDataAccession &&
                                                input.control_id.startsWith(
                                                  'long_term_support_poc_'
                                                )) ||
                                                (sectionHeader !== 'Data Publication Request' && checkboxStatus.sameAsPrincipalInvestigator &&
                                                  input.control_id.startsWith('dar_form_data_accession_poc_')) 
                                            }
                                            readOnly={
                                              readonly ||
                                              Boolean(
                                                getAttribute(
                                                  'readonly',
                                                  question.inputs[c_key]
                                                )
                                              ) ||
                                              (sectionHeader === 'Data Publication Request' && checkboxStatus.sameAsPrimaryDataProducer &&
                                                input.control_id.startsWith('poc_')) ||
                                              (checkboxStatus.sameAsPrimaryLongTermSupport &&
                                                input.control_id.startsWith(
                                                  'long_term_support_poc_'
                                                )) ||
                                              (checkboxStatus.sameAsPrimaryDataAccession &&
                                                input.control_id.startsWith(
                                                  'long_term_support_poc_'
                                                )) ||
                                                (sectionHeader !== 'Data Publication Request' && checkboxStatus.sameAsPrincipalInvestigator &&
                                                  input.control_id.startsWith('dar_form_data_accession_poc_')) 
                                            }
                                            maxLength={getAttribute(
                                              'maxlength',
                                              question.inputs[c_key]
                                            )}
                                            placeholder={
                                              input.required || checkRequiredIf(input)
                                                ? 'required'
                                                : ''
                                            }
                                            onChange={(e) =>
                                              handleFieldChange(
                                                input.control_id,
                                                e.target.value
                                              )
                                            }
                                          />
                                        )}
                                        {input.type === 'textarea' && (
                                          <FormControl
                                            as="textarea"
                                            ref={textareaRef}
                                            className={`${
                                              isError(input)
                                                ? 'form-textarea-error'
                                                : ''
                                            }`}
                                            id={input.control_id}
                                            name={input.control_id}
                                            value={values[input.control_id] || ''}
                                            size="lg"
                                            aria-label={input.control_id}
                                            disabled={
                                              disabled ||
                                              Boolean(
                                                getAttribute(
                                                  'disabled',
                                                  question.inputs[c_key]
                                                )
                                              ) ||
                                              (checkboxStatus.sameAsPrimaryDataProducer &&
                                                input.control_id.startsWith('poc_')) ||
                                              (checkboxStatus.sameAsPrimaryLongTermSupport &&
                                                input.control_id.startsWith(
                                                  'long_term_support_poc_'
                                                )) ||
                                                (checkboxStatus.sameAsPrincipalInvestigator &&
                                                  input.control_id.startsWith('dar_form_data_accession_poc_')) 
                                            }
                                            readOnly={
                                              readonly ||
                                              Boolean(
                                                getAttribute(
                                                  'readonly',
                                                  question.inputs[c_key]
                                                )
                                              ) ||
                                              (checkboxStatus.sameAsPrimaryDataProducer &&
                                                input.control_id.startsWith('poc_')) ||
                                              (checkboxStatus.sameAsPrimaryLongTermSupport &&
                                                input.control_id.startsWith(
                                                  'long_term_support_poc_'
                                                )) ||
                                                (checkboxStatus.sameAsPrincipalInvestigator &&
                                                  input.control_id.startsWith('dar_form_data_accession_poc_')) 
                                            }
                                            cols={getAttribute(
                                              'cols',
                                              question.inputs[c_key]
                                            )}
                                            rows={getAttribute(
                                              'rows',
                                              question.inputs[c_key]
                                            )}
                                            maxLength={getAttribute(
                                              'maxlength',
                                              question.inputs[c_key]
                                            )}
                                            minLength={getAttribute(
                                              'minlength',
                                              question.inputs[c_key]
                                            )}
                                            placeholder={
                                              input.required || checkRequiredIf(input)
                                                ? 'required'
                                                : ''
                                            }
                                            style={{ overflow: 'hidden' }}
                                            onChange={(e) => {
                                              handleFieldChange(
                                                input.control_id,
                                                e.target.value
                                              );
                                              resize(e.target);
                                            }}
                                            onInput={(e) => resize(e.target)}
                                          />
                                        )}
                                        {input.type === 'number' && (
                                          <FormControl
                                            className={`${
                                              isError(input)
                                                ? 'form-input-error'
                                                : ''
                                            }`}
                                            type="number"
                                            id={input.control_id}
                                            name={input.control_id}
                                            value={values[input.control_id] || ''}
                                            size="lg"
                                            aria-label={input.control_id}
                                            disabled={
                                              disabled ||
                                              Boolean(
                                                getAttribute(
                                                  'disabled',
                                                  question.inputs[c_key]
                                                )
                                              ) ||
                                              (checkboxStatus.sameAsPrimaryDataProducer &&
                                                input.control_id.startsWith('poc_')) ||
                                              (checkboxStatus.sameAsPrimaryLongTermSupport &&
                                                input.control_id.startsWith(
                                                  'long_term_support_poc_'
                                                )) ||
                                                (checkboxStatus.sameAsPrincipalInvestigator &&
                                                  input.control_id.startsWith('dar_form_data_accession_poc_')) 
                                            }
                                            readOnly={
                                              readonly ||
                                              Boolean(
                                                getAttribute(
                                                  'readonly',
                                                  question.inputs[c_key]
                                                )
                                              ) ||
                                              (checkboxStatus.sameAsPrimaryDataProducer &&
                                                input.control_id.startsWith('poc_')) ||
                                              (checkboxStatus.sameAsPrimaryLongTermSupport &&
                                                input.control_id.startsWith(
                                                  'long_term_support_poc_'
                                                )) ||
                                                (checkboxStatus.sameAsPrincipalInvestigator &&
                                                  input.control_id.startsWith('dar_form_data_accession_poc_')) 
                                            }
                                            max={getAttribute(
                                              'max',
                                              question.inputs[c_key]
                                            )}
                                            min={getAttribute(
                                              'min',
                                              question.inputs[c_key]
                                            )}
                                            placeholder={
                                              input.required || checkRequiredIf(input)
                                                ? 'required'
                                                : ''
                                            }
                                            onChange={(e) =>
                                              handleFieldChange(
                                                input.control_id,
                                                e.target.value
                                              )
                                            }
                                          />
                                        )}
                                        {input.type === 'datetimePicker' && (
                                          <DatePicker
                                            className={`date-picker-css form-control form-control-lg extra_space ${
                                              isError(input) ? 'form-input-error' : ''
                                            }`}
                                            showIcon
                                            id={input.control_id}
                                            name={input.control_id}
                                            selected={
                                              values[input.control_id]
                                                ? new Date(values[input.control_id])
                                                : null
                                            }
                                            onChange={(date) =>
                                              handleFieldChange(input.control_id, date ? format(date, "yyyy-MM-dd hh:mm aa zzz"): format(new Date(), "yyyy-MM-dd hh:mm aa zzz"))
                                            }
                                            showTimeSelect
                                            timeFormat="HH:mm"
                                            timeIntervals={1}
                                            timeCaption="time"
                                            dateFormat="yyyy-MM-dd h:mm aa"
                                            placeholderText="required"
                                            icon={
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="1em"
                                                height="1em"
                                                viewBox="0 0 48 48"
                                              >
                                                <mask id="ipSApplication0">
                                                  <g
                                                    fill="none"
                                                    stroke="#fff"
                                                    strokeLinejoin="round"
                                                    strokeWidth="4"
                                                  >
                                                    <path
                                                      strokeLinecap="round"
                                                      d="M40.04 22v20h-32V22"
                                                    ></path>
                                                    <path
                                                      fill="#fff"
                                                      d="M5.842 13.777C4.312 17.737 7.263 22 11.51 22c3.314 0 6.019-2.686 6.019-6a6 6 0 0 0 6 6h1.018a6 6 0 0 0 6-6c0 3.314 2.706 6 6.02 6c4.248 0 7.201-4.265 5.67-8.228L39.234 6H8.845l-3.003 7.777Z"
                                                    ></path>
                                                  </g>
                                                </mask>
                                                <path
                                                  fill="currentColor"
                                                  d="M0 0h48v48H0z"
                                                  mask="url(#ipSApplication0)"
                                                ></path>
                                              </svg>
                                            }
                                          />
                                        )}
                                        {input.type === 'select' && (
                                          <Form.Control
                                            as="select"
                                            className={`${
                                              isError(input) ? 'form-select-error' : ''
                                            }`}
                                            id={input.control_id}
                                            name={input.control_id}
                                            value={values[input.control_id] || ''}
                                            size="lg"
                                            aria-label={input.control_id}
                                            options={input.options}
                                            disabled={
                                              disabled ||
                                              Boolean(
                                                getAttribute(
                                                  'disabled',
                                                  question.inputs[c_key]
                                                )
                                              )
                                            }
                                            placeholder={
                                              input.required || checkRequiredIf(input)
                                                ? 'required'
                                                : ''
                                            }
                                            multiple={Boolean(
                                              getAttribute(
                                                'multiple',
                                                question.inputs[c_key]
                                              )
                                            )}
                                            onChange={(e) =>
                                              handleFieldChange(
                                                input.control_id,
                                                e.target.value
                                              )
                                            }
                                          />
                                        )}
                                        {input.type === 'radio' && (
                                          <div
                                            className={`radio-group ${
                                              isError(input)
                                                ? 'radio-group-error'
                                                : ''
                                            }`}
                                          >
                                            {input.enums.map((option, o_key) => (
                                              <label
                                                key={o_key}
                                                className="radio-item"
                                                style={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  marginRight: '15px',
                                                }}
                                              >
                                                <input
                                                  type="radio"
                                                  id={`${input.control_id}_${o_key}`}
                                                  name={input.control_id}
                                                  value={option}
                                                  checked={values[input.control_id] === option}
                                                  onChange={(e) =>
                                                    handleFieldChange(
                                                      input.control_id,
                                                      e.target.value
                                                    )
                                                  }
                                                  className={`${
                                                    isError(input) ? 'form-radio-error' : ''
                                                  }`}
                                                  disabled={
                                                    disabled ||
                                                    Boolean(
                                                      getAttribute(
                                                        'disabled',
                                                        question.inputs[c_key]
                                                      )
                                                    )
                                                  }
                                                />
                                                <label
                                                  htmlFor={`${input.control_id}_${o_key}`}
                                                  style={{ marginLeft: '5px' }}
                                                >
                                                  {option}
                                                </label>
                                                <span className="radio-item-checkmark"></span>
                                              </label>
                                            ))}
                                            <span
                                              className="required"
                                              style={{
                                                display: input.required || checkRequiredIf(input)
                                                  ? 'block'
                                                  : 'none',
                                              }}
                                            >
                                              required
                                            </span>
                                          </div>
                                        )}

                                        {input.type === 'bbox' && (
                                          <div className="bbox-input-group">
                                            {['north', 'east', 'south', 'west'].map(
                                              (direction) => (
                                                <div
                                                  key={`${input.control_id}_${direction}`}
                                                  className="bbox-input"
                                                >
                                                  <label
                                                    htmlFor={`${input.control_id}_${direction}`}
                                                    className="eui-label-nopointer"
                                                  >
                                                    {direction.substring(0, 1).toUpperCase()}:
                                                  </label>
                                                  <FormControl
                                                    className={`bbox ${
                                                      values.validation_errors[
                                                        `${input.control_id}_${direction}`
                                                      ]
                                                        ? 'form-input-error'
                                                        : ''
                                                    }`}
                                                    type="text"
                                                    id={`${input.control_id}_${direction}`}
                                                    name={`${input.control_id}_${direction}`}
                                                    value={
                                                      values[`${input.control_id}_${direction}`] ||
                                                      ''
                                                    }
                                                    size="lg"
                                                    aria-label={`${input.control_id}_${direction}`}
                                                    disabled={
                                                      disabled ||
                                                      Boolean(
                                                        getAttribute(
                                                          'disabled',
                                                          question.inputs[c_key]
                                                        )
                                                      )
                                                    }
                                                    readOnly={
                                                      readonly ||
                                                      Boolean(
                                                        getAttribute(
                                                          'readonly',
                                                          question.inputs[c_key]
                                                        )
                                                      )
                                                    }
                                                    placeholder={
                                                      input.required || checkRequiredIf(input)
                                                        ? 'required'
                                                        : ''
                                                    }
                                                    onChange={(e) =>
                                                      handleFieldChange(
                                                        `${input.control_id}_${direction}`,
                                                        e.target.value
                                                      )
                                                    }
                                                  />
                                                </div>
                                              )
                                            )}
                                            {['north', 'east', 'south', 'west'].map(
                                              (direction) =>
                                                values.validation_errors[
                                                  `${input.control_id}_${direction}`
                                                ] && (
                                                  <div
                                                    className="validation bbox-validation"
                                                    key={`${input.control_id}_${direction}`}
                                                  >
                                                    {
                                                      values.validation_errors[
                                                        `${input.control_id}_${direction}`
                                                      ]
                                                    }
                                                  </div>
                                                )
                                            )}
                                          </div>
                                        )}

                                        <div
                                          style={{
                                            display: input.type === 'table' ? 'block' : 'none',
                                          }}
                                          className="table-div w-100"
                                        >
                                          {input.type === 'table' && (
                                            <span
                                              className="required table-required"
                                              style={{ display: input.required ? 'block' : 'none' }}
                                            >
                                               At least one row required
                                            </span>
                                          )}
                                          {input.type === 'table' && (
                                            <div className="table-div w-100">
                                              <DynamicTable
                                                controlId={input.control_id}
                                                values={values}
                                                handleFieldChange={handleFieldChange}
                                                handleTableFieldChange={handleTableFieldChange}
                                                addRow={addRow}
                                                removeRow={removeRow}
                                                moveUpDown={moveUpDown}
                                                readonly={false}
                                                sectionHeader={sectionHeader}
                                              />
                                            </div>
                                          )}
                                          <p
                                            id={`${input.control_id}_invalid`}
                                            className="eui-banner--danger hidden form-control validation"
                                          >
                                            {getErrorMessage(input, question, section.heading)}
                                          </p>
                                        </div>
                                        <div
                                          className="mt-3"
                                          controlId={input.control_id}
                                          style={{ display: input.type === 'file' ? 'block' : 'none' }}
                                          onDragOver={handleDragOver}
                                          onDragEnter={handleDragEnter}
                                          onDragLeave={handleDragLeave}
                                          onDrop={(e) => handleFileDrop(e, input.control_id)}
                                          onClick={() =>
                                            document.getElementById(`${input.control_id}_file-upload-input`).click()
                                          }
                                        >
                                          <div className="upload-container">
                                            <p>Drag & drop files here, or click to select files</p>
                                            <input type="file" id={`${input.control_id}_file-upload-input`} className="upload-input"  onChange={(e) => handleFileChange(e, input.control_id)} multiple />
                                            {uploadFiles.length > 0 && `${fileControlId}_file-upload-input` === `${input.control_id}_file-upload-input` && (
                                              <p>
                                                <strong>{uploadFiles.length} file(s) selected. Click on upload</strong>
                                              </p>
                                            )}                                            
                                          </div>
                                        </div>
                                        
                                        <div  style={{
                                            display: input.type === 'file' ? 'block' : 'none',
                                          }}>
                                          <Button
                                            className="upload-button mt-2"
                                            onClick={(e) => handleUpload(input.control_id)}
                                            disabled={uploadFlag || uploadFiles.length === 0 || `${fileControlId}_file-upload-input` !== `${input.control_id}_file-upload-input`}
                                          >
                                          Upload
                                          </Button>
                                          {
                                          <span className="d-flex align-items-center">
                                            <FontAwesomeIcon
                                              icon={progressBarsVisible ? faEyeSlash : faEye}
                                              style={{ cursor: 'pointer', marginLeft: '10px', fontSize: '20px' }}
                                              className="ml-2"
                                              onClick={toggleProgressBars}
                                              title={progressBarsVisible ? 'Hide Upload Progress' : 'Show Upload Progress'}
                                            />
                                          </span>}

                                          {progressBarsVisible && uploadFiles.length > 0 && `${fileControlId}_file-upload-input` === `${input.control_id}_file-upload-input` && (
                                            <div>
                                              {uploadFiles.map((file, index) => {
                                                const progress = uploadProgress[file.name];
                                                console.log('progress inside',progress);
                                                const percent = progress?.percent ?? 0;
                                                const eta = progress?.etaSeconds;
                                                let progressText = `${percent}%`;

                                                return (
                                                  <div key={index} style={{ marginBottom: '16px' }}>
                                                    {/* File name + Remove button */}
                                                    <div style={{ display: 'flow-root', marginBottom: '6px' }}>
                                                      {file.name}
                                                      <Button
                                                        className="upload-button"
                                                        style={{
                                                          fontSize: '100%',
                                                          padding: '5px',
                                                          backgroundColor: '#db1400',
                                                          margin: '2px',
                                                          float: 'inline-end'
                                                        }}
                                                        onClick={() => handleRemoveFile(file.name)}
                                                      >
                                                        Remove
                                                      </Button>
                                                    </div>

                                                    {/* Progress bar container */}
                                                      <div style={{
                                                        width: '100%',
                                                        height: '30px',
                                                        backgroundColor: progress === 'Failed' ? 'red' : '#f1f1f1',
                                                        borderRadius: '4px',
                                                        position: 'relative',
                                                        overflow: 'hidden'
                                                      }}>
                                                      <div
                                                        style={{
                                                          width: `${percent}%`,
                                                          height: '100%',
                                                          backgroundColor: percent > 0 ? '#2275aa' : '#fff',
                                                          transition: 'width 250ms ease-out',
                                                          display: 'flex',
                                                          alignItems: 'center',
                                                          justifyContent: percent < 15 ? 'flex-start' : 'center',
                                                          paddingLeft: percent < 15 ? '8px' : '0',
                                                          color: percent === 0 ? 'black' : '#fff',
                                                          fontWeight: 600,
                                                          whiteSpace: 'nowrap'
                                                        }}
                                                      >
                                                        {progressText}
                                                      </div>
                                                    </div>

                                                    {eta != null && (
                                                      <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
                                                        ETA: {formatETA(eta)} remaining
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                        
                                        <div
                                          style={{
                                            display: input.type === 'file' ? 'block' : 'none',
                                          }}
                                          className="table-div w-100"
                                        >
                                          <br />
                                          <p>Files Previously Uploaded</p>
                                          <Table bordered responsive className="uploaded-files-table">
                                            <thead className="uploaded-files-header">
                                              <tr>
                                                {uploadFields.map((field, index) => (
                                                  <th key={index}>{field.label}</th>
                                                ))}
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {Object.keys(uploadedFiles).length > 0 && 
                                              typeof category_map[input.control_id] !== 'undefined' &&
                                              category_map[input.control_id] in uploadedFiles &&
                                              uploadedFiles[category_map[input.control_id]].length > 0 ? (
                                                uploadedFiles[category_map[input.control_id]].map((file, index) => (
                                                  <tr
                                                    key={index}
                                                    className="uploaded-files-row"
                                                  >
                                                    {uploadFields.map((field, colIndex) => (
                                                      <td key={colIndex}>
                                                        {field.formatter
                                                          ? field.formatter(file[field.key])
                                                          : file[field.key]}
                                                      </td>
                                                    ))}
                                                  </tr>
                                                ))
                                              ) : (
                                                <tr>
                                                  <td
                                                    colSpan={uploadFields.length}
                                                    className="text-center"
                                                  >
                                                    There are no records to show
                                                  </td>
                                                </tr>
                                              )}
                                            </tbody>
                                          </Table>
                                        </div>
                                        <p
                                          id={`${input.control_id}_invalid`}
                                          className="eui-banner--danger hidden form-control validation"
                                        ></p>
                                        {getErrorMessage(input) && (
                                          <div className="validation table-validation">
                                            {getErrorMessage(input, question, section.heading)}
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </Row>
                                )}
                              </span>
                            ))}
                          </Col>
                        </Row>
                      </FormGroup>
                    ))}
                  </div>
                </div>
              </Row>
            ))}
          </section>
        </Container>
      </Form>
      <ScrollToTop />
      <Modal show={showUploadSummaryModal} onHide={handleCloseUploadSummaryModal} className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Upload Summary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Successful Uploads for Scanning</h5>
          {uploadResults.success.length > 0 ? (
            <ul>
              {uploadResults.success.map((fileName, index) => (
                <li key={index}>{fileName}</li>
              ))}
            </ul>
          ) : (
            <p>No files were uploaded successfully.</p>
          )}

          <h5>Failed Uploads</h5>
          {uploadResults.failed.length > 0 ? (
            <ul>
              {uploadResults.failed.map(({ fileName, error }, index) => (
                <li
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {fileName}

                  <OverlayTrigger
                    placement="right"
                    overlay={
                      <Tooltip id={`upload-error-${index}`}>
                        {error}
                      </Tooltip>
                    }
                  >
                    <span style={{ display: 'inline-flex' }}>
                      <FontAwesomeIcon
                        icon={faQuestionCircle}
                        style={{
                          cursor: 'pointer',
                          color: '#d54309',
                        }}
                        aria-label={`Upload error for ${fileName}`}
                      />
                    </span>
                  </OverlayTrigger>
                </li>
              ))}
            </ul>
          ) : (
            <p>No files failed to upload.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseUploadSummaryModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showModal} onHide={handleCloseModal} className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Save As Draft Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Your request has been saved. Do you want to be redirected to Earthdata Pub Dashboard
          Requests Page?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            NO
          </Button>
          <Button variant="primary" onClick={handleRedirect}>
            YES
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} className="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>Cancel Confirmation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to cancel?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
          No, Continue Editing
        </Button>
        <Button variant="primary" onClick={() => window.location.href = urlReturn}>
          Yes, Cancel
        </Button>
      </Modal.Footer>
    </Modal>
    </div>
  );
};

export default FormQuestions;
