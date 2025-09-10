import React, { useState } from 'react';
import CueFileUtility from '@edpub/upload-utility';
import _config from '../../config';

const FileUploader = ({ requestId, store, refreshFileList }) => {
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');
  const { apiRoot } = _config;
  const validateFile = (file) => {
    let valid = false;
    let msg = '';
    let statusMsg = 'Please select a different file.';
    if (file.name.match(/\.([^.]+)$/) !== null) {
      var ext = file.name.match(/\.([^.]+)$/)[1];
      if (ext.match(/exe/gi)) {
        msg = 'exe is an invalid file type.';
        resetUploads(msg, statusMsg);
      } else {
        valid = true;
      }
    } else {
      msg = 'The file must have an extension.';
      resetUploads(msg, statusMsg);
    }
    return valid;
  };

  const resetUploads = (msg, statusMsg) => {
    setUploadStatusMsg(statusMsg);
    // Implement any additional reset logic here
  };

  const refreshAuth = async () => {
    const options = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth-token')}`
      }
    };
    const response = await fetch(`${apiRoot}token/refresh`, options);
    const { token } = await response.json();
    localStorage.setItem('auth-token', token);
    store.dispatch({ type: 'SET_TOKEN', payload: token });
  };

  const uploadFiles = async (event) => {
    const file = event.target.files[0];
    let alertMsg = '';
    let statusMsg = '';

    if (validateFile(file)) {
      setUploadStatusMsg('Uploading');

      const upload = new CueFileUtility();

      try {
        ///await refreshAuth();
        let payload = {
          fileObj: file,
          authToken: localStorage.getItem('auth-token'),
        };
        if (requestId) {
          payload['apiEndpoint'] = `${apiRoot}data/upload/getPostUrl`;
          payload['submissionId'] = requestId;
        }
        const resp = await upload.uploadFile(payload);
        let error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error;
        if (error) {
          alertMsg = `An error has occurred on uploadFile: ${error}.`;
          statusMsg = `Select a file`;
          console.log(`An error has occurred on uploadFile: ${error}.`);
          resetUploads(alertMsg, statusMsg);
        } else {
          alertMsg = '';
          statusMsg = 'Upload Complete';
          resetUploads(alertMsg, statusMsg);
          setTimeout(() => setUploadStatusMsg('Select a file'), 1000);

          if (requestId) {
            refreshFileList();
          }
        }
      } catch (error) {
        console.log(`try catch error: ${error.stack}`);
        alertMsg = `An error has occurred on uploadFile`;
        statusMsg = `Select a file`;
        resetUploads(alertMsg, statusMsg);
      }
    }
  };

  return (
    <div>
      <input type="file" onChange={uploadFiles} />
      <div>{uploadStatusMsg}</div>
    </div>
  );
};

export default FileUploader;
