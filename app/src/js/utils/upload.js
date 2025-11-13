'use strict';
import { CueFileUtility, LocalUpload } from '@edpub/upload-utility';
import { loadToken } from '../utils/auth';
import _config from '../config';

export const handleUpload = async ({ files, categoryType, groupId, conversationId}) => {
    //TODO- Ideally this should be a standardized upload method which can be used by all upload
    // components rather than having x number of components and repeated methods
    const successFiles = [];
    const failedFiles = [];
    const { apiRoot, useCUEUpload } = _config;
  
    const uploadFileAsync = (file) => {
      return new Promise((resolve, reject) => {
        // Update progress function
        const updateProgress = (progress, fileObj) => {
        };

        let payload = {
          fileObj: file,
          authToken: loadToken().token,
          apiEndpoint: `${apiRoot}data/upload/getAttachmentUploadUrl`,
          endpointParams: { conversation_id: conversationId }
        };
  
        const upload = (useCUEUpload?.toLowerCase?.() === 'false' ? new LocalUpload() : new CueFileUtility());
        upload.uploadFile(payload, updateProgress)
          .then((resp) => {
            const error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error;
            if (error) {
              console.error(`Error uploading file ${file.name}: ${error}`);
              reject(file.name);
            } else {
              resolve(file.name);
            }
          })
          .catch((err) => {
            console.error(`Error uploading file ${file.name}: ${err}`);
            reject(file.name);
          });
      });
    };

    const validateFile = (file) =>{
      let valid = false;
      if (file.name.match(/\.([^\.]+)$/) !== null) {
        var ext = file.name.match(/\.([^\.]+)$/)[1];
        if (!ext.match(/exe/gi)) valid = true;
      }
      return valid;
    }
  
    const uploadPromises = [...files].map(async (file) => {
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
  
    return {success: successFiles, failed: failedFiles}
  }