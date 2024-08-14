import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { Button, Form, Container, Row, Col, FormGroup, FormControl, Alert, Spinner, Table, Modal } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo, faUndo, faPlus, faTrashAlt, faArrowUp, faArrowDown, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from 'react-redux';
import './FormQuestions.css';
import DynamicTable from './DynamicTable';
import ScrollToTop from './ScrollToTop';
import {
  shortDateShortTimeYearFirstJustValue,
  calculateStorage
} from '../../utils/format';
import { saveForm, submitFilledForm, setTokenState, listFileUploadsBySubmission } from '../../actions';
import Loading from '../LoadingIndicator/loading-indicator';
import _config from '../../config';
import localUpload from '@edpub/upload-utility';

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
  const [values, setValues] = useState({ validation_errors: {} });
  const [questions, setQuestions] = useState([]);
  const [daacInfo, setDaacData] = useState({});
  const [valueHistory, setValueHistory] = useState([{}]);
  const [valueHistoryUndoIdx, setValueHistoryUndoIdx] = useState(0);
  const [alertVariant, setAlertVariant] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [dismissCountDown, setDismissCountDown] = useState(0);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadStatusMsg, setUploadStatusMsg] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fakeTable, setFakeTable] = useState([{}]);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
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
  const [showModal, setShowModal] = useState(false); 
  const [checkboxStatus, setCheckboxStatus] = useState({
    sameAsPrimaryDataProducer: false,
    sameAsPrimaryLongTermSupport: false,
    sameAsPrimaryDataAccession: false
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
        values
      }
    }));
  };
  
  const fetchFileUploads = async () => {
    console.log('called');
    if (requestData  && requestData.id) {
      try {
        const resp = await dispatch(listFileUploadsBySubmission(requestData.id));
        
        if (JSON.stringify(resp) === '{}' || JSON.stringify(resp) === '[]' || (resp.data && resp.data.length === 0)) {
          return;
        }
        
        const error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error;
        if (error) {
          if (!error.match(/not authorized/gi) && !error.match(/not implemented/gi)) {
            const str = `An error has occurred while getting the list of files: ${error}.`;
            console.log(str);
            return;
          } else {
            return;
          }
        }

        const files = resp.data;

        // Sort files by lastModified date, most recent first
        files.sort((a, b) => {
          const keyA = new Date(a.lastModified);
          const keyB = new Date(b.lastModified);
          return keyB - keyA;
        });

        // Set the files in state
        setUploadedFiles(files); 

      } catch (error) {
        console.error('Failed to fetch file uploads:', error);
      }
    }
  };

  useEffect(() => {
    fetchFileUploads();
  }, [requestData]);
  
  useEffect(() => {
    console.log('requestData', requestData)
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
  
      if (requestData && requestData.form_data) {
        Object.keys(requestData.form_data).forEach(key => {
          if (initialValues.hasOwnProperty(key)) {
            initialValues[key] = requestData.form_data[key];
          } else {
            if (key === 'same_as_poc_name_data_producer_info_name') {
              initialValues[key] = requestData.form_data[key];
              setCheckboxStatus((prev) => ({ ...prev, sameAsPrimaryDataProducer: requestData.form_data[key] }));
            }else if(key === 'same_as_long_term_support_poc_name_poc_name'){
              initialValues[key] = requestData.form_data[key];
              setCheckboxStatus((prev) => ({ ...prev, sameAsPrimaryDataAccession: requestData.form_data[key] }));
            }else if(key === 'same_as_long_term_support_poc_name_data_producer_info_name'){
              initialValues[key] = requestData.form_data[key];
              setCheckboxStatus((prev) => ({ ...prev, sameAsPrimaryLongTermSupport: requestData.form_data[key] }));
            }else if(key && typeof requestData.form_data[key] !== 'object' ){
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
              input.enums.forEach(enumItem => {
                defaultRow[enumItem.key] = '';
              });
              if (!initialValues[input.control_id] || initialValues[input.control_id].length === 0) {
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
    ['poc_name', 'poc_organization', 'poc_department', 'poc_email', 'poc_orcid'].forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.disabled = checkboxStatus.sameAsPrimaryDataProducer;
      }
    });
  
    ['long_term_support_poc_name', 'long_term_support_poc_organization', 'long_term_support_poc_department', 'long_term_support_poc_email', 'long_term_support_poc_orcid'].forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.disabled = checkboxStatus.sameAsPrimaryLongTermSupport || checkboxStatus.sameAsPrimaryDataAccession;
      }
    });
  }, [checkboxStatus]);

  useEffect(() => {
    if (dismissCountDown > 0) {
      const intervalId = setInterval(() => {
        setDismissCountDown(prevCount => prevCount - 1);
      }, 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [dismissCountDown]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      saveFile('draft');
    }, 600000);

    return () => clearInterval(intervalId);
  }, []);

  const allowOnlyNumbers = (event) => {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  };

  const isFieldRequired = (input) => {
    if (input.required_if && (input.required_if).length === 0) {
      return input.required || false;
    }
    const result = input.required_if.some(condition => {
      return values[condition.field] === (condition.value === "true" ? true : condition.value === "false" ? false : condition.value);
    });
    return result;
  };

  const validateField = (controlId, value, long_name) => {
    let errorMessage = '';
    const input = questions.flatMap(section => section.questions)
                            .flatMap(question => question.inputs)
                            .find(input => input.control_id === controlId);

    if (input) {
      const fieldRequired = isFieldRequired(input);

      if (fieldRequired && (!value || value === "") && input.type !== 'bbox') {
        errorMessage = `${long_name ? long_name + ' - ' : ''}${input.label || long_name} is required`;
      } else if (input.type === 'number' && isNaN(value)) {
        errorMessage = `${input.label || long_name} must be a valid number`;
      } else if (input.type === 'email' && !/\S+@\S+\.\S+/.test(value)) {
        errorMessage = `${input.label || long_name} must be a valid email address`;
      } else if (input.type === 'datetimePicker' && isNaN(new Date(value).getTime())) {
        errorMessage = `${input.label || long_name} must be a valid date and time`;
      } else if (input.type === 'select' && !input.options.includes(value)) {
        errorMessage = `${input.label || long_name} must be a valid option`;
      } else if (input.type === 'radio' && value && !input.enums.includes(value)) {
        errorMessage = `${long_name ? long_name + ' - ' : ''}${input.label || long_name} must be a valid option`;
      } else if (input.type === 'table') {
        const result = value.some(producer => areProducerFieldsEmpty(producer));
        result || value.length == 0 ? errorMessage = `${input.label || long_name} both First Name and Last Name are required`:'';
      } else if (input.type === 'bbox') {
        const directions = ['north', 'east', 'south', 'west'];
        const lst = []
        for (let direction of directions) {
          const bboxError = getBboxError(controlId, direction, input);
          if (bboxError) {
            errorMessage = bboxError;
            let controlId2 = `${controlId}_${direction}`;
            lst.push({'errorMessage': errorMessage, 'controlId':controlId2})
          }
        }
        return lst
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
        return "Must be a number";
      }
      let this_val = parseFloat(values[`${control_id}_${direction}`]);
      let comp_direction = {
        south: "north",
        west: "east",
      };
      let comp_val = parseFloat(values[`${control_id}_${comp_direction[direction]}`]);
  
      if (/west|south/.test(direction) && this_val > comp_val) {
        return `Spatial Information - Data Product Horizontal Spatial Coverage - ${label}: ${label} must be less than ${comp_direction[direction].substring(0, 1).toUpperCase()}`;
      }
      if (direction === "west" && this_val >= 180.0) {
        return `Spatial Information - Data Product Horizontal Spatial Coverage - ${label}: ${label} must be less than 180.0`;
      }
      if (direction === "east" && this_val <= -180.0) {
        return `Spatial Information - Data Product Horizontal Spatial Coverage - ${label}: ${label} must be greater than -180.0`;
      }
      if (direction === "south" && this_val >= 90.0) {
        return `Spatial Information - Data Product Horizontal Spatial Coverage - ${label}: ${label} must be less than 90.0`;
      }
      if (direction === "north" && this_val <= -90.0) {
        return `Spatial Information - Data Product Horizontal Spatial Coverage - ${label}: ${label} must be greater than -90.0`;
      }
      if (direction === "west" && this_val < -180.0) {
        return `Spatial Information - Data Product Horizontal Spatial Coverage - ${label}: ${label} is out of range. ${label} must be greater than -180.0`;
      }
      if (direction === "east" && this_val > 180.0) {
        return `Spatial Information - Data Product Horizontal Spatial Coverage - ${label}: ${label} is out of range. ${label} must be less than 180.0`;
      }
      if (direction === "south" && this_val < -90.0) {
        return `Spatial Information - Data Product Horizontal Spatial Coverage - ${label}: ${label} is out of range. ${label} must be greater than -90.0`;
      }
      if (direction === "north" && this_val > 90.0) {
        return `Spatial Information - Data Product Horizontal Spatial Coverage - ${label}: ${label} is out of range. ${label} must be less than 90.0`;
      }
    }
    return !values[`${control_id}_${direction}`] && input.required ? `Spatial Information - Data Product Horizontal Spatial Coverage - ${label}:  is required`: undefined;
  };

  const areProducerFieldsEmpty = (producer) => {
    return producer.producer_first_name === "" || producer.producer_last_name_or_organization === "";
  }
  
  const validateFields = (checkAllFields = true, jsonObj) => {
    const newValidationErrors = {};
    const input2 = questions.flatMap(section => section.questions).find(question => question.long_name === 'Data Format' && question.inputs.filter(input => input.label !== 'Other' && values[input.control_id]).length === 0)
    if(input2) newValidationErrors['data_format_other_info'] = 'Data Format section is required';
    questions.forEach((section) => {
      section.questions.forEach((question) => {
        question.inputs.forEach((input) => {
          const value = jsonObj.data && jsonObj.data[input.control_id];
          if (checkAllFields || value) {
            if (input.type === 'bbox') {   
                const errorMessage = validateField(input.control_id, 'direction', question.long_name);
                 for (const element of errorMessage) {
                  newValidationErrors[element.controlId] = element.errorMessage;
                }
            } 
            else {
              const [errorMessage, fieldId] = validateField(input.control_id, value, question.long_name);
              if (errorMessage) {
                newValidationErrors[fieldId] = errorMessage;
              }
            }
          }
        });
      });
    });
    console.log('newValidationErrors', newValidationErrors)
    setValues((prev) => ({ ...prev, validation_errors: newValidationErrors }));
    return Object.keys(newValidationErrors).length === 0;
  };
    
  const handleFieldChange = (controlId, value) => {
    setValues((prevValues) => {
      const newValues = { ...prevValues, [controlId]: value, validation_errors: { ...prevValues.validation_errors } };
  
      if (checkboxStatus.sameAsPrimaryDataProducer && controlId.startsWith('data_producer_info_')) {
        const updatedField = controlId.replace('data_producer_info_', 'poc_');
        newValues[updatedField] = value;
      }
  
      if (checkboxStatus.sameAsPrimaryLongTermSupport && controlId.startsWith('data_producer_info_')) {
        const updatedField = controlId.replace('data_producer_info_', 'long_term_support_poc_');
        newValues[updatedField] = value;
      }
  
      if (checkboxStatus.sameAsPrimaryDataAccession && controlId.startsWith('poc_')) {
        const updatedField = controlId.replace('poc_', 'long_term_support_poc_');
        newValues[updatedField] = value;
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
    setValues(prevValues => {
      const updatedTable = [...(prevValues[controlId] || [])];
      const updatedRow = { ...updatedTable[rowIndex] };
      updatedRow[key] = value;
      updatedTable[rowIndex] = updatedRow;
      return {
        ...prevValues,
        [controlId]: updatedTable,
      };
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

  const getErrorMessage = (input, question, sectionHeading) => {
    return values.validation_errors && values.validation_errors[input.control_id] ? sectionHeading+' - ' + values.validation_errors[input.control_id] : '';
  };
  
  const isError = (input) => values.validation_errors && values.validation_errors[input.control_id];
  
  const { basepath } = _config;

  const urlReturn = `${basepath}requests`;

  const submitForm = (e) => {
    e.preventDefault();
    logAction('Submit');
    setValidationAttempted(true);
    saveFile("submit");
  };

  const cancelForm = () => {
    window.location.href = urlReturn;
  };

  const draftFile = (e) => {
    e.preventDefault();
    logAction('Save as draft');
    saveFile("draft");
    setShowModal(true); 
  };
  

  const filterEmptyObjects = (array) => {
    return array.filter(obj => {
      if (!obj || typeof obj !== 'object') {
        return false;
      }
  
      const keys = Object.keys(obj);
      if (keys.length < 2) {
        return true; // keep the object if it has less than 2 keys
      }
  
      const firstKey = keys[0];
      const lastKey = keys[keys.length - 1];
  
      return obj[firstKey] !== "" || obj[lastKey] !== "";
    });
  };

  const processAndStringifyValues = (jsonObject) => {
    const result = {};

    for (const key in jsonObject) {
        if (jsonObject.hasOwnProperty(key)) {
            const value = jsonObject[key];
            
            // Skip keys with `false` values
            if (value !== false) {
                // Convert the value to a string
                result[key] = String(value);
            }
        }
    }
    return result;
  }
    


  const saveFile = async (type) => {
    const fieldValues = { ...values };
    let jsonObject = {
      data: {},
      log: {},
      versions: {}, 
      form_id: daacInfo.step_data && daacInfo.step_data.form_id, 
      id: daacInfo.id, 
      daac_id: daacInfo.daac_id 
    };
  
    Object.keys(fieldValues).forEach(key => {
      if (Array.isArray(fieldValues[key])) {
        jsonObject.data[key] = filterEmptyObjects(fieldValues[key]);
      } else if (fieldValues[key] !== "") {
        jsonObject.data[key] = fieldValues[key];
      }
    });    

    const processedData = processAndStringifyValues(jsonObject.data);
    jsonObject.log = logs;
    jsonObject.data = processedData
    
    
    console.log('jsonObject', jsonObject);

    if(type === 'continueEditing'){
      setValidationAttempted(true);
      validateFields(true, jsonObject);
      await dispatch(saveForm(jsonObject));
      setAlertVariant('success');
      setAlertMessage('Your request has been saved.');
      setDismissCountDown(10);
      return;
    }

    if(type === 'draft'){
      setValidationAttempted(false);
      validateFields(false, jsonObject);
      await dispatch(saveForm(jsonObject));
      return;
    }
    if(type === 'submit'){
      if (validateFields(true, jsonObject)) {
        await dispatch(submitFilledForm(jsonObject));
        window.location.href = urlReturn;
      } else {
        setAlertVariant('danger');
        setAlertMessage('You have errors to correct before you can submit your request. You can save your request as a draft and come back.');
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
      setValueHistoryUndoIdx(valueHistoryUndoIdx - 1);
      setValues((prevValues) => ({
        ...valueHistory[valueHistoryUndoIdx - 1],
        validation_errors: valueHistory[valueHistoryUndoIdx - 1].validation_errors || {},
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
  
    keys.forEach(key => {
      emptyProducer[key] = "";
    });
  
    return emptyProducer;
  }

  const addRow = (tableId) => {
    const updatedTable = [...(values[tableId] || []), clearProducerData(values[tableId])];
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


  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadStatusMsg(`Selected file: ${file.name}`);
    } else {
      setUploadStatusMsg('No file selected');
    }
  };

  const refreshAuth = async () => {
    const options = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth-token')}`
      }
    };
    await fetch(`${apiRoot}token/refresh`, options)
    .then(r => r.json())
    .then(( { token }) => {
      localStorage.setItem('auth-token', token);
      dispatch(setTokenState(token));
    });
  }

  const { apiRoot } = _config;

  const handleUpload = async () => {
    setUploadStatusMsg('Uploading...');
    setShowProgressBar(true);
    setProgressValue(0);
  
    const updateProgress = (progress, fileObj) => {
      console.log('progress', progress);
      console.log('fileobj', fileObj);
      setProgressValue(Math.min(progress, 100));
      setUploadFileName(fileObj ? fileObj.name : '');    
    };

    let alertMsg = '';
    let statusMsg = '';
    if (validateFile(uploadFile)) {
      const upload = new localUpload();
      const requestId = daacInfo.id;
  
      try {
        //await refreshAuth(); // Function to refresh authentication token if needed
  
        let payload = {
          fileObj: uploadFile,
          authToken: localStorage.getItem('auth-token'),
        };
  
        if (requestId) {
          payload['apiEndpoint'] = `${apiRoot}data/upload/getPostUrl`;
          payload['submissionId'] = requestId;
        }
        
        console.log('payload', payload);
  
        const resp = await upload.uploadFile(payload, updateProgress);
        const error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error;
  
        console.log('resp', resp)
        if (error) {
          alertMsg = `An error has occurred on uploadFile: ${error}.`;
          statusMsg = 'Select a file';
          console.error(alertMsg);
          resetUploads(alertMsg, statusMsg);
        } else {
          alertMsg = '';
          statusMsg = 'Upload Complete';
          setUploadedFiles([...uploadedFiles, {
            file_name: uploadFile.name,
            size: uploadFile.size,
            lastModified: uploadFile.lastModified,
          }]);
          resetUploads(alertMsg, statusMsg);
          //updateUploadStatusWithTimeout('Select another file', 1000);
        }
      } catch (error) {
        console.error(`try catch error: ${error.stack}`);
        alertMsg = 'An error has occurred during the upload.';
        statusMsg = 'Select a file';
        resetUploads(alertMsg, statusMsg);
      }
    }
  };
  
  

  const handleCloseModal = () => setShowModal(false);
  const handleRedirect = () => {
    window.location.href = urlReturn;
  }


  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;

    if (name === 'sameAsPrimaryDataProducer') {
        setCheckboxStatus((prev) => ({ ...prev, [name]: checked }));
            setValues((prevValues) => ({
                ...prevValues,
                same_as_poc_name_data_producer_info_name: checked,
                poc_name: prevValues.data_producer_info_name,
                poc_organization: prevValues.data_producer_info_organization,
                poc_department: prevValues.data_producer_info_department,
                poc_email: prevValues.data_producer_info_email,
                poc_orcid: prevValues.data_producer_info_orcid,
            }));
        
    } else if (name === 'sameAsPrimaryLongTermSupport') {
        setCheckboxStatus((prev) => ({
            ...prev,
            [name]: checked,
            sameAsPrimaryDataAccession: checked ? false : prev.sameAsPrimaryDataAccession,
        }));
            setValues((prevValues) => ({
                ...prevValues,
                same_as_long_term_support_poc_name_data_producer_info_name: checked,
                same_as_long_term_support_poc_name_poc_name: checked ? false : prevValues.same_as_long_term_support_poc_name_poc_name,
                long_term_support_poc_name: prevValues.data_producer_info_name,
                long_term_support_poc_organization: prevValues.data_producer_info_organization,
                long_term_support_poc_department: prevValues.data_producer_info_department,
                long_term_support_poc_email: prevValues.data_producer_info_email,
                long_term_support_poc_orcid: prevValues.data_producer_info_orcid,
            }));
    } else if (name === 'sameAsPrimaryDataAccession') {
        setCheckboxStatus((prev) => ({
            ...prev,
            [name]: checked,
            sameAsPrimaryLongTermSupport: checked ? false : prev.sameAsPrimaryLongTermSupport,
        }));
            setValues((prevValues) => ({
                ...prevValues,
                same_as_long_term_support_poc_name_data_producer_info_name: checked ? false : prevValues.same_as_long_term_support_poc_name_data_producer_info_name,
                same_as_long_term_support_poc_name_poc_name: checked,
                long_term_support_poc_name: prevValues.poc_name,
                long_term_support_poc_organization: prevValues.poc_organization,
                long_term_support_poc_department: prevValues.poc_department,
                long_term_support_poc_email: prevValues.poc_email,
                long_term_support_poc_orcid: prevValues.poc_orcid,
            }));
    }
};

  return (
    !requestData ? (<Loading/>) : (
      <div role="main" className='questions-component'>
        <Form ref={formRef} name="questions_form" id="questions_form" onSubmit={submitForm} onInvalid={handleInvalid} onChange={handleInvalid}>
          <div className="sticky-navbar">
            <div className="button_bar">
              <div align="left" className="left_button_bar" style={{ display: readonly ? 'none' : 'block' }}>
                <Button className={`button ${valueHistory.length - valueHistoryUndoIdx <= 1 ? 'disabled' : ''}`} disabled={valueHistory.length - valueHistoryUndoIdx <= 1} onClick={redoToPreviousState} aria-label="redo button">
                  <FontAwesomeIcon icon={faRedo} /> {redoLabel}
                </Button>
                <Button className={`button ${valueHistoryUndoIdx <= 0 ? 'disabled' : ''}`} disabled={valueHistoryUndoIdx <= 0} onClick={undoToPreviousState} aria-label="undo button">
                  <FontAwesomeIcon icon={faUndo} /> {undoLabel}
                </Button>
              </div>
              <div align="right" className="right_button_bar" style={{ display: readonly ? 'none' : 'block' }}>
                <Button className="eui-btn--blue" disabled={Object.keys(values).length === 0} onClick={() => { logAction('Save and continue editing'); saveFile("continueEditing") }} aria-label="save button">
                  {saveLabel}
                </Button>
                <Button className="eui-btn--blue" disabled={Object.keys(values).length === 0} onClick={draftFile} aria-label="draft button">
                  {draftLabel}
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
            <h3 id="daac_selection" style={{ display: daacInfo && daacInfo.daac_name !== '' ? 'block' : 'none', 'textAlign': 'left' }}>
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
                        <FormGroup key={b_key} className={`form-group-error ${(values[`question_${a_key}_${b_key}`] || {}).$error ? 'form-group-error' : ''}`} size="lg" lg={12} disabled={disabled} readOnly={readonly} style={{ display: showIf(question.show_if) ? 'block' : 'none' }}>
                          <legend className="hidden">Fill out the form input fields.</legend>
                          <input type="hidden" id={`question_${a_key}_${b_key}`} style={{ display: question.required ? 'block' : 'none' }} aria-label="Question Required Message" />
                          <h3 className="sub-section-heading" htmlFor={question.short_name}>
                            {question.long_name}: {' '}
                            <span className="small" id={question.short_name || a_key}>{question.text}</span>
                            <span className="col text-right section_required" style={{ display: question.required ? 'block' : 'none' }}>required</span>
                          </h3>
                          <p className="text-muted" style={{ display: question.help !== 'undefined' ? 'block' : 'none' }} dangerouslySetInnerHTML={{ __html: question.help }}/>
                          <div className="checkbox-group">
                            {question.long_name === 'Data Accession Point of Contact' && (
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
                            {question.long_name === 'Long-term Support Point of Contact' && (
                              <>
                                {
                                  <>
                                    <label className="checkbox-item">
                                      Same as Primary Data Producer
                                      <input
                                        type="checkbox"
                                        name="sameAsPrimaryLongTermSupport"
                                        checked={checkboxStatus.sameAsPrimaryLongTermSupport}
                                        //disabled ={checkboxStatus.sameAsPrimaryDataAccession}
                                        onChange={handleCheckboxChange}
                                      />
                                      <span className="checkmark"></span>
                                    </label>
                                    <label className="checkbox-item">
                                      Same as Primary Data Accession
                                      <input
                                        type="checkbox"
                                        name="sameAsPrimaryDataAccession"
                                        checked={checkboxStatus.sameAsPrimaryDataAccession}
                                        onChange={handleCheckboxChange}
                                       // disabled ={checkboxStatus.sameAsPrimaryLongTermSupport}
                                      />
                                      <span className="checkmark"></span>
                                    </label>
                                  </>
                                }
                              </>
                            )}
                            <div className={`radio-group ${validationAttempted && question.long_name === 'Data Format' && question.inputs.filter(input => values[input.control_id]).length === 0 ? 'radio-group-error' : ''}`}>
                                {question.inputs.map((input, c_key) => (
                              <label key={input.control_id} className="checkbox-item" style={{ display: input.type === 'checkbox' ? 'flex' : 'none', alignItems: 'center', marginRight: '15px' }}>
                                <input
                                  type="checkbox"
                                  className={`form-checkbox ${isError(input) ? 'form-checkbox-error' : ''}`}
                                  id={input.control_id}
                                  name={input.control_id}
                                  value={values[input.control_id] || ''}
                                  checked={!!values[input.control_id]} 
                                  uncheckedvalue="false"
                                  aria-label={input.label}
                                  disabled={disabled || Boolean(getAttribute('disabled', question.inputs[c_key]))}
                                  onChange={(e) => handleFieldChange(input.control_id, e.target.checked)}
                                />
                                <label htmlFor={input.control_id} style={{ marginLeft: '5px' }}>{input.label}</label>
                                <span className="checkmark"></span>
                                <span className="required" style={{ display: input.required || checkRequiredIf(input) ? 'block' : 'none' }}>required</span>
                                {getErrorMessage(input, question, section.heading) && (
                                            <div className="validation">{getErrorMessage(input, question, section.heading)}</div>
                                          )}
                              </label>
                              ))
                              }
                            </div>
                          </div>
                          <Row className='row-align'>
                            <Col lg={question.size || 16} className="question_size">
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
                                                parseInt(charactersRemaining(values[input.control_id], getAttribute('maxlength', question.inputs[c_key]))) >= 0
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
                                                      disabled ||
                                                      Boolean(getAttribute('disabled', question.inputs[c_key])) ||
                                                      (checkboxStatus.sameAsPrimaryDataProducer && input.control_id.startsWith('poc_')) ||
                                                      (checkboxStatus.sameAsPrimaryLongTermSupport && input.control_id.startsWith('long_term_support_poc_')) ||
                                                      (checkboxStatus.sameAsPrimaryDataAccession && input.control_id.startsWith('long_term_support_poc_'))
                                                  }
                                                  readOnly={
                                                      readonly ||
                                                      Boolean(getAttribute('readonly', question.inputs[c_key])) ||
                                                      (checkboxStatus.sameAsPrimaryDataProducer && input.control_id.startsWith('poc_')) ||
                                                      (checkboxStatus.sameAsPrimaryLongTermSupport && input.control_id.startsWith('long_term_support_poc_')) ||
                                                      (checkboxStatus.sameAsPrimaryDataAccession && input.control_id.startsWith('long_term_support_poc_'))
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
                                                {getErrorMessage(input, question, section.heading)}
                                              </p>
                                            </>
                                          )}
                                          {input.type === 'email' && (
                                            <FormControl
                                              className={`${isError(input) ? 'form-input-error' : ''}`}
                                              type="text"
                                              id={input.control_id}
                                              name={input.control_id}
                                              value={values[input.control_id] || ''}
                                              size="lg"
                                              aria-label={input.control_id}
                                              disabled={
                                                disabled ||
                                                Boolean(getAttribute('disabled', question.inputs[c_key])) ||
                                                (checkboxStatus.sameAsPrimaryDataProducer && input.control_id.startsWith('poc_')) ||
                                                (checkboxStatus.sameAsPrimaryLongTermSupport && input.control_id.startsWith('long_term_support_poc_')) ||
                                                (checkboxStatus.sameAsPrimaryDataAccession && input.control_id.startsWith('long_term_support_poc_'))
                                            }
                                              readOnly={
                                                readonly ||
                                                Boolean(getAttribute('readonly', question.inputs[c_key])) ||
                                                (checkboxStatus.sameAsPrimaryDataProducer && input.control_id.startsWith('poc_')) ||
                                                (checkboxStatus.sameAsPrimaryLongTermSupport && input.control_id.startsWith('long_term_support_poc_')) ||
                                                (checkboxStatus.sameAsPrimaryDataAccession && input.control_id.startsWith('long_term_support_poc_'))
                                            }
                                              maxLength={getAttribute('maxlength', question.inputs[c_key])}
                                              placeholder={input.required || checkRequiredIf(input) ? 'required' : ''}
                                              onChange={(e) => handleFieldChange(input.control_id, e.target.value)}
                                            />
                                          )}
                                          {input.type === 'textarea' && (
                                            <FormControl
                                              as="textarea"
                                              ref={textareaRef}
                                              className={`${isError(input) ? 'form-textarea-error' : ''}`}
                                              id={input.control_id}
                                              name={input.control_id}
                                              value={values[input.control_id] || ''}
                                              size="lg"
                                              aria-label={input.control_id}
                                              disabled={
                                                disabled || Boolean(getAttribute('disabled', question.inputs[c_key])) || (checkboxStatus.sameAsPrimaryDataProducer && input.control_id.startsWith('poc_')) || (checkboxStatus.sameAsPrimaryLongTermSupport && input.control_id.startsWith('long_term_support_poc_'))
                                              }
                                              readOnly={
                                                readonly || Boolean(getAttribute('readonly', question.inputs[c_key])) || (checkboxStatus.sameAsPrimaryDataProducer && input.control_id.startsWith('poc_')) || (checkboxStatus.sameAsPrimaryLongTermSupport && input.control_id.startsWith('long_term_support_poc_'))
                                              }
                                              cols={getAttribute('cols', question.inputs[c_key])}
                                              rows={getAttribute('rows', question.inputs[c_key])}
                                              maxLength={getAttribute('maxlength', question.inputs[c_key])}
                                              minLength={getAttribute('minlength', question.inputs[c_key])}
                                              placeholder={input.required || checkRequiredIf(input) ? 'required' : ''}
                                              style={{ overflow: 'hidden' }}
                                              onChange={(e) => {
                                                handleFieldChange(input.control_id, e.target.value);
                                                resize(e.target);
                                              }}
                                              onInput={(e) => resize(e.target)}
                                            />
                                          )}
                                          {input.type === 'number' && (
                                            <FormControl
                                              className={`${isError(input) ? 'form-input-error' : ''}`}
                                              type="number"
                                              id={input.control_id}
                                              name={input.control_id}
                                              value={values[input.control_id] || ''}
                                              size="lg"
                                              aria-label={input.control_id}
                                              disabled={
                                                disabled || Boolean(getAttribute('disabled', question.inputs[c_key])) || (checkboxStatus.sameAsPrimaryDataProducer && input.control_id.startsWith('poc_')) || (checkboxStatus.sameAsPrimaryLongTermSupport && input.control_id.startsWith('long_term_support_poc_'))
                                              }
                                              readOnly={
                                                readonly || Boolean(getAttribute('readonly', question.inputs[c_key])) || (checkboxStatus.sameAsPrimaryDataProducer && input.control_id.startsWith('poc_')) || (checkboxStatus.sameAsPrimaryLongTermSupport && input.control_id.startsWith('long_term_support_poc_'))
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
                                                <label key={o_key} className="radio-item" style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
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
                                                  <span className="radio-item-checkmark"></span>
                                                </label>
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
                                                  
                                                </div>
                                              ))}
                                             {['north', 'east', 'south', 'west'].map((direction) => (
                                                values.validation_errors[`${input.control_id}_${direction}`] && (
                                                  <div className="validation" key={`${input.control_id}_${direction}`}>
                                                    {values.validation_errors[`${input.control_id}_${direction}`]}
                                                  </div>
                                                )
                                              ))}

                                            </div>
                                          )}

                                          <div
                                            style={{ display: input.type === 'table' ? 'block' : 'none' }}
                                            className="table-div w-100"
                                          >
                                          {input.type === 'table' && <span className="required table-required" style={{ display: input.required ? 'block' : 'none' }}>required</span>
                                        }
                                            {input.type === 'table' && (
                                              <div className="table-div w-100">
                                                <DynamicTable
                                                  controlId={input.control_id}
                                                  values={values}
                                                  handleFieldChange={handleTableFieldChange}
                                                  addRow={addRow}
                                                  removeRow={removeRow}
                                                  moveUpDown={moveUpDown}
                                                  readonly={false} 
                                                />
                                              </div>
                                            )}
                                            <p id={`${input.control_id}_invalid`} className="eui-banner--danger hidden form-control validation">
                                              {getErrorMessage(input, question, section.heading)}
                                            </p>
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
                                            <div className="validation">{getErrorMessage(input, question, section.heading)}</div>
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
        <Modal show={showModal} onHide={handleCloseModal} className="custom-modal">
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

      </div>
    )
  );
}

export default FormQuestions;
