import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { Button, Form, Container, Row, Col, FormGroup, FormControl, Alert, Spinner, Table, Modal } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo, faUndo, faPlus, faTrashAlt, faArrowUp, faArrowDown, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { validate as validateFile } from '@edpub/upload-utility';
import { useDispatch } from 'react-redux';
import './FormQuestions.css';
import DynamicTable from './DynamicTable';
import ScrollToTop from './ScrollToTop';
import {
  shortDateShortTimeYearFirstJustValue,
  calculateStorage
} from '../../utils/format';
import { saveForm, submitFilledForm } from '../../actions';
import Loading from '../LoadingIndicator/loading-indicator';

const FormQuestions = ({
  cancelLabel = "Cancel",
  draftLabel = "Save as draft",
  saveLabel = "Save and continue editing",
  undoLabel = "Undo",
  redoLabel = "Redo",
  submitLabel = "Submit",
  enterSubmit = false,
  readonly = false,
  disabled = false,
  showCancelButton = true,
  formData,
  requestData
}) => {
  const [values, setValues] = useState({});
  const [questions, setQuestions] = useState([]);
  const [daacInfo, setDaacData] = useState({});
  const [contactFields, setContactFields] = useState([]);
  const [valueHistory, setValueHistory] = useState([{}]);
  const [valueHistoryUndoIdx, setValueHistoryUndoIdx] = useState(0);
  const [alertVariant, setAlertVariant] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [dismissCountDown, setDismissCountDown] = useState(0);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadQuestionId, setUploadQuestionId] = useState("");
  const [uploadStatusMsg, setUploadStatusMsg] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fakeTable, setFakeTable] = useState([{}]);
  const [uploadFields, setUploadFields] = useState([
    {
      key: 'file_name',
      label: 'Filename'
    }, {
      key: 'size',
      label: 'Size',
      formatter: (value) => calculateStorage(value)
    }, {
      key: 'sha256Checksum',
      label: 'sha256Checksum',
    }, {
      key: 'lastModified',
      label: 'Last Modified',
      formatter: (value) => shortDateShortTimeYearFirstJustValue(value),
    }
  ]);
  const [timer, setTimer] = useState(null);
  const [logs, setLogs] = useState({});
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false); // State to track checkbox status

  const formRef = useRef(null);
  const { id } = useParams();
  const dispatch = useDispatch();
  const dee = [{"key":"ef229725-1cad-485e-a72b-a276d2ca3175/7e11241c-6f7e-408c-aac9-a718cc2ca38b/971bff66-6d6e-4f59-a100-fe75d6519804/2.txt","size":81,"lastModified":"2024-07-17T17:16:51.000Z","file_name":"2.txt","sha256Checksum":"4tcuX4gClsavyCL1x97VvwaGIloqarATuy/8R5cy06U="},{"key":"ef229725-1cad-485e-a72b-a276d2ca3175/7e11241c-6f7e-408c-aac9-a718cc2ca38b/971bff66-6d6e-4f59-a100-fe75d6519804/3.txt","size":81,"lastModified":"2024-07-17T17:19:34.000Z","file_name":"3.txt","sha256Checksum":"4tcuX4gClsavyCL1x97VvwaGIloqarATuy/8R5cy06U="},{"key":"ef229725-1cad-485e-a72b-a276d2ca3175/7e11241c-6f7e-408c-aac9-a718cc2ca38b/971bff66-6d6e-4f59-a100-fe75d6519804/test.txt","size":53,"lastModified":"2024-07-17T17:07:06.000Z","file_name":"test.txt","sha256Checksum":"fttht8edofrijAMnBPJsZOHPnf+8hK6elL4ZiSaJZSA="}];
  const history = useHistory()
  const logAction = (action) => {
    setLogs((prevLogs) => ({
      ...prevLogs,
      [new Date().toString()]: {
        action,
        values
      }
    }));
  };

  useEffect(() => {
    setUploadedFiles(dee);
    
    if (formData) {
      setQuestions(formData.sections);
      const initialValues = {};
      formData.sections.forEach((section) => {
        section.questions.forEach((question) => {
          question.inputs.forEach((input) => {
            initialValues[input.control_id] = input.type === 'checkbox' ? false : '';
          });
        });
      });
  
      // Prefill values if they exist in requestData.form_data
      if (requestData && requestData.form_data) {
        Object.keys(requestData.form_data).forEach(key => {
          //console.log('key', key)
          if (initialValues.hasOwnProperty(key)) {
            //console.log('key', key)
            initialValues[key] = requestData.form_data[key];
          }else{
            if(key === 'same_as_poc_name_data_producer_info_name' && requestData.form_data[key]){
              initialValues[key] = requestData.form_data[key];
                setIsCheckboxChecked(true);
            }
          }
        });
      }
      setValues({ ...initialValues, validation_errors: {} });
    }
  
    if (requestData) {
      setDaacData(requestData);
    }
  }, [formData, requestData]);
  
  useEffect(() => {
    if (isCheckboxChecked) {
      ['poc_name', 'poc_organization', 'poc_department', 'poc_email', 'poc_orcid'].forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
          field.blur();
          field.disabled = true;
        }
      });
    } else {
      ['poc_name', 'poc_organization', 'poc_department', 'poc_email', 'poc_orcid'].forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
          field.disabled = false;
        }
      });
    }
  }, [isCheckboxChecked]);
  
  useEffect(() => {
    if (dismissCountDown > 0) {
      const intervalId = setInterval(() => {
        setDismissCountDown(prevCount => prevCount - 1);
      }, 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [dismissCountDown]);


  const allowOnlyNumbers = (event) => {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  };

  const isFieldRequired = (input) => {
    if (input.required_if && (input.required_if).length == 0) {
      return input.required || false;
    }
    const result = input.required_if.some(condition => {
      return values[condition.field] == (condition.value === "true" ? true : condition.value === "false" ? false : condition.value);
    });
    return result;
  };

  const validateField = (controlId, value) => {
    let errorMessage = '';
    const input = questions.flatMap(section => section.questions)
                            .flatMap(question => question.inputs)
                            .find(input => input.control_id === controlId);
  
    if (input) {
      const fieldRequired = isFieldRequired(input);
      if (fieldRequired && (!value || value === "") && input.type !== 'bbox') {
        errorMessage = `${input.label || controlId} is required`;
      } else if (input.type === 'number' && isNaN(value)) {
        errorMessage = `${input.label || controlId} must be a valid number`;
      } else if (input.type === 'email' && !/\S+@\S+\.\S+/.test(value)) {
        errorMessage = `${input.label || controlId} must be a valid email address`;
      } else if (input.type === 'datetimePicker' && isNaN(new Date(value).getTime())) {
        errorMessage = `${input.label || controlId} must be a valid date and time`;
      } else if (input.type === 'select' && !input.options.includes(value)) {
        errorMessage = `${input.label || controlId} must be a valid option`;
      } else if (input.type === 'radio' && !input.enums.includes(value)) {
        errorMessage = `${input.label || controlId} must be a valid option`;
      } else if (input.type === 'bbox') {
        const directions = ['north', 'east', 'south', 'west'];
        for (let direction of directions) {
          const bboxError = getBboxError(controlId, direction);
          if (bboxError) {
            errorMessage = bboxError;
            controlId = `${controlId}_${direction}`;
            break;
          }
        }
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
  
  const getBboxError = (control_id, direction) => {
    if (values[`${control_id}_${direction}`]) {
      if (isNaN(values[`${control_id}_${direction}`])) {
        return "Must be a number";
      }
      let this_val = parseFloat(values[`${control_id}_${direction}`]);
      let comp_direction = {
        south: "north",
        west: "east",
      };
      let comp_val = parseFloat(values[`${control_id}_${comp_direction[direction]}`]);
      let label = `${direction.substring(0, 1).toUpperCase()}`;
  
      if (/west|south/.test(direction) && this_val > comp_val) {
        return `${label} must be less than ${comp_direction[direction].substring(0, 1).toUpperCase()}`;
      }
      if (direction === "west" && this_val >= 180.0) {
        return `${label} must be less than 180.0`;
      }
      if (direction === "east" && this_val <= -180.0) {
        return `${label} must be greater than -180.0`;
      }
      if (direction === "south" && this_val >= 90.0) {
        return `${label} must be less than 90.0`;
      }
      if (direction === "north" && this_val <= -90.0) {
        return `${label} must be greater than -90.0`;
      }
      if (direction === "west" && this_val < -180.0) {
        return `${label} is out of range. ${label} must be greater than -180.0`;
      }
      if (direction === "east" && this_val > 180.0) {
        return `${label} is out of range. ${label} must be less than 180.0`;
      }
      if (direction === "south" && this_val < -90.0) {
        return `${label} is out of range. ${label} must be greater than -90.0`;
      }
      if (direction === "north" && this_val > 90.0) {
        return `${label} is out of range. ${label} must be less than 90.0`;
      }
    }
    return "";
  };
  
  const validateFields = (checkAllFields = true) => {
    const newValidationErrors = {};
    questions.forEach((section) => {
      section.questions.forEach((question) => {
        question.inputs.forEach((input) => {
          const value = values[input.control_id];
          if (checkAllFields || value) {
            if (input.type === 'bbox') {
              ['north', 'east', 'south', 'west'].forEach((direction) => {
                const [errorMessage, fieldId] = validateField(input.control_id, values[`${input.control_id}_${direction}`]);
                if (errorMessage) {
                  newValidationErrors[fieldId] = errorMessage;
                }
              });
            } else {
              const [errorMessage, fieldId] = validateField(input.control_id, value);
              if (errorMessage) {
                newValidationErrors[fieldId] = errorMessage;
              }
            }
          }
        });
      });
    });
    setValues((prev) => ({ ...prev, validation_errors: newValidationErrors }));
    console.log('ValidationErrors', newValidationErrors)
    return Object.keys(newValidationErrors).length === 0;
  };
  
  const validateFilledFields = () => {
    const newValidationErrors = {};
    questions.forEach((section) => {
      section.questions.forEach((question) => {
        question.inputs.forEach((input) => {
          const value = values[input.control_id];
          if (value !== undefined && value !== '') {
            const errorMessage = validateField(input.control_id, value);
            if (errorMessage) {
              newValidationErrors[input.control_id] = errorMessage;
            }
          }
        });
      });
    });
    setValues((prev) => ({ ...prev, validation_errors: newValidationErrors }));
    return Object.keys(newValidationErrors).length === 0;
  };
    
  const handleFieldChange = (controlId, value) => {
    setValues((prevValues) => {
      const newValues = { ...prevValues, [controlId]: value };
  
      // Propagate changes if "Same as Data Producer" is checked
      if (values['same_as_poc_name_data_producer_info_name']) {
        const dataProducerFields = ['name', 'organization', 'department', 'email', 'orcid'];
        dataProducerFields.forEach(field => {
          if (controlId.startsWith('data_producer_info_')) {
            const updatedField = controlId.replace('data_producer_info_', 'poc_');
            newValues[updatedField] = value;
          }
        });
      }
  
      saveToHistory(newValues);
      return newValues;
    });
  
    if (!value || value === '' && values.validation_errors[controlId]) {
      handleInvalid({ target: { name: controlId, validationMessage: `${controlId} is required` } });
    } else {
      handleInvalid({ target: { name: controlId, validationMessage: '' } });
    }
  };

  const handleTableFieldChange = (controlId, rowIndex, key, value) => {
    const updatedTable = [...(values[controlId] || [])];
    updatedTable[rowIndex][key] = value;
    setValues((prevValues) => {
      const newValues = { ...prevValues, [controlId]: updatedTable };
      saveToHistory(newValues);
      return newValues;
    });
  };

  const handleInvalid = (evt) => {
    const { name, validationMessage } = evt.target;
    const errorElement = document.getElementById(`${name}_invalid`);

    if (errorElement) {
      errorElement.textContent = validationMessage;
      errorElement.classList.toggle("hidden", !validationMessage);
    }

    if (validationMessage) {
      setValues((prev) => ({
        ...prev,
        validation_errors: {
          ...prev.validation_errors,
          [name]: validationMessage,
        }
      }));
    } else {
      setValues((prev) => {
        const newValidationErrors = { ...prev.validation_errors };
        delete newValidationErrors[name];
        return { ...prev, validation_errors: newValidationErrors };
      });
    }
  };

  const getErrorMessage = (input, question) => {
    const value = question && question.long_name && question.long_name.length > 0 ? question.long_name +' - ': ''
    return values.validation_errors && values.validation_errors[input.control_id] ? value + values.validation_errors[input.control_id] : '';
  };
  
  const isError = (input) => values.validation_errors && values.validation_errors[input.control_id];
  
  const submitForm = (e) => {
   e.preventDefault();
    logAction('Submit');
    if (validateFields()) {
      saveFile("submit");
      window.location.href = '/requests';
    } else {
      setAlertVariant('danger');
      setAlertMessage('You have errors to correct before you can submit your request. You can save your request as a draft and come back.');
      setDismissCountDown(5);
    }
  };

  const cancelForm = () => {
    window.location.href = '/requests';
  };

  const draftFile = (e) => {
    e.preventDefault();
    logAction('Save as draft');
    saveFile("draft");
    setShowModal(true); 
  };
  

  const saveFile = async (type) => {
    const fieldValues = { ...values };
    let jsonObject = {
      data: {},
      log: {},
      versions: {}, // Assuming you need to add versions as well
      form_id: daacInfo.step_data.form_id, // Use appropriate form_id
      id: daacInfo.id, // Use appropriate id or handle it dynamically
      daac_id: daacInfo.daac_id // Use appropriate daac_id or handle it dynamically
    };
  
    // Remove fields with empty strings and build the data object
    Object.keys(fieldValues).forEach(key => {
      if (fieldValues[key] !== "") {
        jsonObject.data[key] = fieldValues[key];
      }
    });
  
    jsonObject.log = logs;
  
    if(type === 'continueEditing'){
      validateFields(true);
      await dispatch(saveForm(jsonObject));
      setAlertVariant('success');
      setAlertMessage(' Your request has been saved.');
      setDismissCountDown(10);
      return;
    }

    if(type === 'draft'){
      validateFields(false);
      await dispatch(saveForm(jsonObject));
      return;
    }

    if(type === 'submit'){
      await dispatch(submitFilledForm(jsonObject));
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
    setValueHistory([...history, newValues]);
    setValueHistoryUndoIdx(history.length);
  };

  const redoToPreviousState = () => {
    if (valueHistoryUndoIdx < valueHistory.length - 1) {
      setValueHistoryUndoIdx(valueHistoryUndoIdx + 1);
      setValues(valueHistory[valueHistoryUndoIdx + 1]);
    }
    logAction('Redo');
  };

  const undoToPreviousState = () => {
    if (valueHistoryUndoIdx > 0) {
      setValueHistoryUndoIdx(valueHistoryUndoIdx - 1);
      setValues(valueHistory[valueHistoryUndoIdx - 1]);
    }
    logAction('Undo');
  };

  const resize = (id) => {
    const textarea = document.getElementById(id);
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

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

  const addRow = (tableId) => {
    const updatedTable = [...(values[tableId] || []), { firstName: '', middleInitial: '', lastName: '' }];
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
    if (direction === "up" && rowIndex > 0) {
      [updatedTable[rowIndex], updatedTable[rowIndex - 1]] = [updatedTable[rowIndex - 1], updatedTable[rowIndex]];
    }
    if (direction === "down" && rowIndex < updatedTable.length - 1) {
      [updatedTable[rowIndex], updatedTable[rowIndex + 1]] = [updatedTable[rowIndex + 1], updatedTable[rowIndex]];
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

  const anySameAsSelected = (controlId) => {
    const toBaseName = controlId.replace(/_name/g, "").replace(/_organization/g, '').replace(/_department/g, '').replace(/_email/g, '').replace(/_orcid/g, '');
    for (let ea in values) {
      if (new RegExp(`^same_as_${toBaseName}`).test(ea) && values[ea] === true) {
        return true;
      }
    }
    return false;
  };

  const setFieldValue = (controlId, value) => {
    setValues((prevValues) => ({
      ...prevValues,
      [controlId]: value,
    }));
  };

  const getAttribute = (attr, input) => {
    return input.attributes ? input.attributes[attr] : undefined;
  };

  const charactersRemaining = (value, maxlength) => {
    return maxlength ? maxlength - (value ? value.length : 0) : undefined;
  };

  const isFormFilled = Object.values(values).some(value => value !== '');

  const handleFileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadFile(file);
      setUploadStatusMsg(`Selected file: ${file.name}`);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadStatusMsg(`Selected file: ${file.name}`);
    }
  };

  const handleUpload = () => {
    if (uploadFile) {
      setUploadStatusMsg('Uploading...');
      // Simulate file upload
      setTimeout(() => {
        setUploadStatusMsg('Upload complete');
        setUploadedFiles([...uploadedFiles, {
          file_name: uploadFile.name,
          size: uploadFile.size,
          lastModified: uploadFile.lastModified,
          sha256Checksum: 'mockChecksum'
        }]);
        setUploadFile(null);
      }, 1000);
    }
  };

  const handleCloseModal = () => setShowModal(false);
  const handleRedirect = () => window.location.href = '/requests';

  const checkBoxChecked = (e) => {
    if (e.target.checked) {
      setValues((prevValues) => {
        const newValues = {
          ...prevValues,
          same_as_poc_name_data_producer_info_name: e.target.checked,
          poc_name: prevValues.data_producer_info_name,
          poc_organization: prevValues.data_producer_info_organization,
          poc_department: prevValues.data_producer_info_department,
          poc_email: prevValues.data_producer_info_email,
          poc_orcid: prevValues.data_producer_info_orcid,
        };
        saveToHistory(newValues);
        return newValues;
      });
      setIsCheckboxChecked(true);
    } else {
      setValues((prevValues) => {
        const newValues = {
          ...prevValues,
          same_as_poc_name_data_producer_info_name: e.target.checked,
          poc_name: '',
          poc_organization: '',
          poc_department: '',
          poc_email: '',
          poc_orcid: '',
        };
        saveToHistory(newValues);
        return newValues;
      });
      setIsCheckboxChecked(false);
    }
  };
  
  return (
    !requestData ? (<Loading/>) : (<div role="main" className='questions-component'>
      <Form ref={formRef} name="questions_form" id="questions_form" onSubmit={submitForm} onInvalid={handleInvalid} onChange={handleInvalid}>
        <div className="sticky-navbar">
          <div className="button_bar">
            <div align="left" className="left_button_bar" style={{ display: readonly ? 'none' : 'block' }}>
              <Button className={`button ${valueHistoryUndoIdx <= 0 ? 'disabled' : ''}`} disabled={valueHistoryUndoIdx <= 0} onClick={undoToPreviousState} aria-label="undo button">
                <FontAwesomeIcon icon={faUndo} /> {undoLabel}
              </Button>
              <Button className={`button ${valueHistory.length - valueHistoryUndoIdx <= 1 ? 'disabled' : ''}`} disabled={valueHistory.length - valueHistoryUndoIdx <= 1} onClick={redoToPreviousState} aria-label="redo button">
                <FontAwesomeIcon icon={faRedo} /> {redoLabel}
              </Button>
            </div>
            <div align="right" className="right_button_bar" style={{ display: readonly ? 'none' : 'block' }}>
              <Button className="eui-btn--blue" disabled={Object.keys(values).length === 0} onClick={draftFile} aria-label="draft button">
                {draftLabel}
              </Button>
              <Button className="eui-btn--blue" disabled={Object.keys(values).length === 0} onClick={() => { logAction('Save and continue editing'); saveFile("continueEditing") }} aria-label="save button">
                {saveLabel}
              </Button>
              <Button className="eui-btn--green" disabled={Object.keys(values).length === 0} aria-label="submit button" type="submit">
                {submitLabel}
              </Button>
              <Button className="eui-btn--red" disabled={!showCancelButton} onClick={cancelForm} aria-label="cancel button">
                {cancelLabel}
              </Button>
            </div>
          </div>
        </div>
        <Alert className="sticky-alert" show={dismissCountDown > 0} variant={alertVariant} dismissible onClose={() => setDismissCountDown(0)}>
          {alertMessage}
        </Alert>
        <Container name="questions_container" id="questions_container">
          <h3 id="daac_selection" style={{ display: daacInfo && daacInfo.daac_name !== '' ? 'block' : 'none' }}>
            DAAC Selected: <span id="daac_name" className="question_section w-100" onClick={() => history.push('/daac/selection/')}>
              <span className="eui-link" id="daac_name_link" title="go to the EDPub Group Selection">{daacInfo.daac_name}</span>
            </span>
          </h3>
          <section>
            {questions.map((section, a_key) => (
              <Row key={a_key} className='row-align'>
                <li className="eui-banner--danger same-as-html5" style={{ display: (values[`section_${a_key}`] || {}).$error ? 'block' : 'none' }}>
                  Section {section.heading} is required
                </li>
                <div className={`w-100 form-section ${(values[`section_${a_key}`] || {}).$error ? 'form-section-error' : ''}`} style={{ display: showIf(section.heading_show_if) ? 'block' : 'none' }}>
                  <input type="hidden" id={`section_${a_key}`} style={{ display: section.heading_required ? 'block' : 'none' }} />
                  <h2 className="section-heading">{section.heading}</h2>
                  <div id={a_key} className="question_section w-100">
                    {section.questions.map((question, b_key) => (
                      <FormGroup key={b_key} className={`form-group-error ${(values[`question_${a_key}_${b_key}`] || {}).$error ? 'form-group-error' : ''}`} size="lg" lg={12} disabled={disabled} readonly={readonly} style={{ display: showIf(question.show_if) ? 'block' : 'none' }}>
                        <legend className="hidden">Fill out the form input fields.</legend>
                        <input type="hidden" id={`question_${a_key}_${b_key}`} style={{ display: question.required ? 'block' : 'none' }} aria-label="Question Required Message" />
                        <h3 className="sub-section-heading" htmlFor={question.short_name}>
                          {question.long_name} : {' '}
                          <span className="small" id={question.short_name || a_key}>{question.text}</span>
                          <span className="col text-right section_required" style={{ display: question.required ? 'block' : 'none' }}>required</span>
                        </h3>
                        <p className="text-muted" style={{ display: question.help !== 'undefined' ? 'block' : 'none' }} dangerouslySetInnerHTML={{ __html: question.help }}/>
                        {question.long_name === 'Data Accession Point of Contact'? <span>{'Same as Primary Data Producer: '} <input
                                    type="checkbox"
                                    onChange={checkBoxChecked}
                                    checked={values['same_as_poc_name_data_producer_info_name'] || false}
                                  /> </span>:''}
                        <Row className='row-align'>
                          <Col lg={question.size || 16} className="question_size">
                            <div className="checkbox-group">
                              {question.inputs.map((input, c_key) => (
                                <div key={input.control_id} className="checkbox-item" style={{ display: input.type === 'checkbox' ? 'flex' : 'none', alignItems: 'center', marginRight: '15px' }}>
                                  <input
                                    type="checkbox"
                                    className={`form-checkbox ${isError(input) ? 'form-checkbox-error' : ''}`}
                                    id={input.control_id}
                                    name={input.control_id}
                                    value={values[input.control_id] || ''}
                                    checked={!!values[input.control_id]} // Ensuring a boolean value
                                    uncheckedValue="false"
                                    aria-label={input.label}
                                    disabled={disabled || Boolean(getAttribute('disabled', question.inputs[c_key]))}
                                    onChange={(e) => handleFieldChange(input.control_id, e.target.checked)}
                                  />
                                  <label htmlFor={input.control_id} style={{ marginLeft: '5px' }}>{input.label}</label>
                                  <span className="required" style={{ display: input.required || checkRequiredIf(input) ? 'block' : 'none' }}>required</span>
                                </div>
                              ))}
                            </div>        
                            {question.inputs.map((input, c_key) => (
                              <span key={c_key}>
                                {input.type !== 'checkbox' && (
                                  <Row className='row-align'>
                                    {showIf(input.show_if) && (
                                      <>
                                        <label
                                          htmlFor={input.control_id || `${input}_${c_key}`}
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
                                          }}
                                        >
                                          {input.label}:
                                        </label>
                                        <span
                                          className="date_formats"
                                          style={{ display: input.type === 'datetimePicker' ? 'block' : 'none' }}
                                        >
                                          Format: <span className="date_formats_required">YYYY-MM-DD hh:mm AM/PM</span>
                                        </span>
                                        <label
                                          style={{
                                            display:
                                              (input.type === 'textarea' || input.type === 'text') &&
                                              parseInt(charactersRemaining(values[input.control_id], getAttribute('maxlength', question.inputs[c_key]))) > 0
                                                ? 'block'
                                                : 'none',
                                          }}
                                        >
                                          {charactersRemaining(values[input.control_id], getAttribute('maxlength', question.inputs[c_key]))} characters left
                                        </label>
                                        {input.type === 'text' && (
                                          <>
                                            <FormControl
                                              className={`${isError(input) ? 'form-input-error' : ''}`}
                                              type="text"
                                              id={input.control_id}
                                              name={input.control_id}
                                              value={values[input.control_id] || ''}
                                              size="lg"
                                              aria-label={input.control_id}
                                              disabled={
                                                disabled || Boolean(getAttribute('disabled', question.inputs[c_key])) || (isCheckboxChecked && input.control_id.startsWith('poc_'))
                                              }
                                              readOnly={
                                                readonly || Boolean(getAttribute('readonly', question.inputs[c_key])) || (isCheckboxChecked && input.control_id.startsWith('poc_'))
                                              }
                                              pattern={getAttribute('pattern', question.inputs[c_key])}
                                              maxLength={getAttribute('maxlength', question.inputs[c_key])}
                                              minLength={getAttribute('minlength', question.inputs[c_key])}
                                              max={getAttribute('max', question.inputs[c_key])}
                                              min={getAttribute('min', question.inputs[c_key])}
                                              placeholder={input.required || checkRequiredIf(input) ? 'required' : ''}
                                              onChange={(e) => handleFieldChange(input.control_id, e.target.value)}
                                            />
                                            <p id={`${input.control_id}_invalid`} className="eui-banner--danger hidden form-control validation">
                                              {getErrorMessage(input, question)}
                                            </p>
                                          </>
                                        )}
                                        {input.type === 'email' && (
                                          <FormControl
                                            className={`${isError(input) ? 'form-input-error' : ''}`}
                                            type="email"
                                            id={input.control_id}
                                            name={input.control_id}
                                            value={values[input.control_id] || ''}
                                            size="lg"
                                            aria-label={input.control_id}
                                            disabled={
                                              disabled || Boolean(getAttribute('disabled', question.inputs[c_key])) || (isCheckboxChecked && input.control_id.startsWith('poc_'))
                                            }
                                            readOnly={
                                              readonly || Boolean(getAttribute('readonly', question.inputs[c_key])) || (isCheckboxChecked && input.control_id.startsWith('poc_'))
                                            }
                                            maxLength={getAttribute('maxlength', question.inputs[c_key])}
                                            placeholder={input.required || checkRequiredIf(input) ? 'required' : ''}
                                            onChange={(e) => handleFieldChange(input.control_id, e.target.value)}
                                          />
                                        )}
                                        {input.type === 'textarea' && (
                                          <FormControl
                                            as="textarea"
                                            className={`${isError(input) ? 'form-textarea-error' : ''}`}
                                            id={input.control_id}
                                            name={input.control_id}
                                            value={values[input.control_id] || ''}
                                            size="lg"
                                            aria-label={input.control_id}
                                            disabled={
                                              disabled || Boolean(getAttribute('disabled', question.inputs[c_key])) || (isCheckboxChecked && input.control_id.startsWith('poc_'))
                                            }
                                            readOnly={
                                              readonly || Boolean(getAttribute('readonly', question.inputs[c_key])) || (isCheckboxChecked && input.control_id.startsWith('poc_'))
                                            }
                                            cols={getAttribute('cols', question.inputs[c_key])}
                                            rows={getAttribute('rows', question.inputs[c_key])}
                                            maxLength={getAttribute('maxlength', question.inputs[c_key])}
                                            minLength={getAttribute('minlength', question.inputs[c_key])}
                                            placeholder={input.required || checkRequiredIf(input) ? 'required' : ''}
                                            onFocus={() => resize(input.control_id)}
                                            onKeyUp={() => resize(input.control_id)}
                                            onChange={(e) => handleFieldChange(input.control_id, e.target.value)}
                                          />
                                        )}
                                        {input.type === 'number' && (
                                          <FormControl
                                            className={`${isError(input) ? 'form-input-error' : ''}`}
                                            type="text" // Use type="text" to prevent browser's built-in number input controls
                                            id={input.control_id}
                                            name={input.control_id}
                                            value={values[input.control_id] || ''}
                                            size="lg"
                                            aria-label={input.control_id}
                                            disabled={
                                              disabled || Boolean(getAttribute('disabled', question.inputs[c_key])) || (isCheckboxChecked && input.control_id.startsWith('poc_'))
                                            }
                                            readOnly={
                                              readonly || Boolean(getAttribute('readonly', question.inputs[c_key])) || (isCheckboxChecked && input.control_id.startsWith('poc_'))
                                            }
                                            max={getAttribute('max', question.inputs[c_key])}
                                            min={getAttribute('min', question.inputs[c_key])}
                                            placeholder={input.required || checkRequiredIf(input) ? 'required' : ''}
                                            onKeyPress={allowOnlyNumbers}
                                            onChange={(e) => handleFieldChange(input.control_id, e.target.value)}
                                          />
                                        )}

                                        {input.type === 'datetimePicker' && (
                                          <DatePicker
                                            className={`date-picker-css form-control form-control-lg extra_space ${isError(input) ? 'form-input-error' : ''}`}
                                            showIcon
                                            id={input.control_id}
                                            name={input.control_id}
                                            selected={values[input.control_id] ? new Date(values[input.control_id]) : null}
                                            onChange={(date) => handleFieldChange(input.control_id, date)}
                                            showTimeSelect
                                            timeFormat="HH:mm"
                                            timeIntervals={1}
                                            timeCaption="time"
                                            dateFormat="MMMM d, yyyy h:mm aa"
                                            placeholderText="required"
                                            icon={
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="1em"
                                                height="1em"
                                                viewBox="0 0 48 48"
                                              >
                                                <mask id="ipSApplication0">
                                                  <g fill="none" stroke="#fff" strokeLinejoin="round" strokeWidth="4">
                                                    <path strokeLinecap="round" d="M40.04 22v20h-32V22"></path>
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
                                            className={`${isError(input) ? 'form-select-error' : ''}`}
                                            id={input.control_id}
                                            name={input.control_id}
                                            value={values[input.control_id] || ''}
                                            size="lg"
                                            aria-label={input.control_id}
                                            options={input.options}
                                            disabled={disabled || Boolean(getAttribute('disabled', question.inputs[c_key]))}
                                            placeholder={input.required || checkRequiredIf(input) ? 'required' : ''}
                                            multiple={Boolean(getAttribute('multiple', question.inputs[c_key]))}
                                            onChange={(e) => handleFieldChange(input.control_id, e.target.value)}
                                          />
                                        )}
                                        {input.type === 'radio' && (
                                          <div className={`radio-group ${isError(input) ? 'radio-group-error' : ''}`}>
                                            {input.enums.map((option, o_key) => (
                                              <div key={o_key} className="radio-item" style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
                                                <input
                                                  type="radio"
                                                  id={`${input.control_id}_${o_key}`}
                                                  name={input.control_id}
                                                  value={option}
                                                  checked={values[input.control_id] === option}
                                                  onChange={(e) => handleFieldChange(input.control_id, e.target.value)}
                                                  className={`${isError(input) ? 'form-radio-error' : ''}`}
                                                  disabled={disabled || Boolean(getAttribute('disabled', question.inputs[c_key]))}
                                                />
                                                <label htmlFor={`${input.control_id}_${o_key}`} style={{ marginLeft: '5px' }}>
                                                  {option}
                                                </label>
                                              </div>
                                            ))}
                                            <span className="required" style={{ display: input.required || checkRequiredIf(input) ? 'block' : 'none' }}>required</span>
                                          </div>
                                        )}

                                        {input.type === 'bbox' && (
                                          <div className="bbox-input-group">
                                            {['north', 'east', 'south', 'west'].map((direction) => (
                                              <div key={`${input.control_id}_${direction}`} className="bbox-input">
                                                <label htmlFor={`${input.control_id}_${direction}`} className="eui-label-nopointer">
                                                  {direction.substring(0, 1).toUpperCase()}:
                                                </label>
                                                <FormControl
                                                  className={`bbox ${values.validation_errors[`${input.control_id}_${direction}`] ? 'form-input-error' : ''}`}
                                                  type="text"
                                                  id={`${input.control_id}_${direction}`}
                                                  name={`${input.control_id}_${direction}`}
                                                  value={values[`${input.control_id}_${direction}`] || ''}
                                                  size="lg"
                                                  aria-label={`${input.control_id}_${direction}`}
                                                  disabled={disabled || Boolean(getAttribute('disabled', question.inputs[c_key]))}
                                                  readOnly={readonly || Boolean(getAttribute('readonly', question.inputs[c_key]))}
                                                  placeholder={input.required || checkRequiredIf(input) ? 'required' : ''}
                                                  onChange={(e) => handleFieldChange(`${input.control_id}_${direction}`, e.target.value)}
                                                />
                                                {values.validation_errors[`${input.control_id}_${direction}`] && (
                                                  <div className="validation">
                                                    {values.validation_errors[`${input.control_id}_${direction}`]}
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        <div
                                          style={{ display: input.type === 'table' ? 'block' : 'none' }}
                                          className="table-div w-100"
                                        >
                                          <DynamicTable
                                            controlId={input.control_id}
                                            values={values}
                                            handleFieldChange={handleTableFieldChange}
                                            addRow={addRow}
                                            removeRow={removeRow}
                                            moveUpDown={moveUpDown}
                                          />
                                        </div>
                                        <div
                                          className="mt-3"
                                          style={{ display: input.type === 'file' ? 'block' : 'none' }}
                                          onDragOver={handleDragOver}
                                          onDragEnter={handleDragEnter}
                                          onDragLeave={handleDragLeave}
                                          onDrop={handleFileDrop}
                                          onClick={() => document.getElementById('file-upload-input').click()}
                                        >
                                          <input
                                            type="file"
                                            id="file-upload-input"
                                            className="upload-input"
                                            onChange={handleFileChange}
                                          />
                                          <div className='upload-container'>
                                            <p>Drag & drop a file here, or click to select a file</p>
                                          </div>
                                          <p className="upload-status">{uploadStatusMsg}</p>
                                          <Button className="upload-button mt-2" onClick={handleUpload} disabled={!uploadFile}>
                                            Upload
                                          </Button>
                                        </div>
                                        <div
                                          style={{ display: input.type === 'file' ? 'block' : 'none' }}
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
                                              {uploadedFiles.length > 0 ? (
                                                uploadedFiles.map((file, index) => (
                                                  <tr key={index} className="uploaded-files-row">
                                                    {uploadFields.map((field, colIndex) => (
                                                      <td key={colIndex}>{field.formatter ? field.formatter(file[field.key]) : file[field.key]}</td>
                                                    ))}
                                                  </tr>
                                                ))
                                              ) : (
                                                <tr>
                                                  <td colSpan={uploadFields.length} className="text-center">
                                                    There are no records to show
                                                  </td>
                                                </tr>
                                              )}
                                            </tbody>
                                          </Table>
                                        </div>
                                        <p id={`${input.control_id}_invalid`} className="eui-banner--danger hidden form-control validation"></p>
                                        {getErrorMessage(input) && (
                                          <div className="validation">{getErrorMessage(input, question)}</div>
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
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Your request has been saved. Do you want to be redirected to Earthdata Pub Dashboard Requests Page?
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
    </div>)
  );
}

export default FormQuestions;