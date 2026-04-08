'use strict';

import { CueFileUtility, LocalUpload } from '@edpub/upload-utility';
import { loadToken } from '../utils/auth';
import _config from '../config';

export const handleUpload = async ({
  files = [],
  categoryType,
  groupId,
  conversationId,
  controlId,

  submissionId,
  categoryMap = {},
  uploadType = 'attachment',

  // UI callbacks
  setUploadStatusMsg,
  setUploadFlag,
  setUploadProgress,
  setUploadResults,
  setUploadFileFlag,
  setShowUploadSummaryModal,
  clearFiles,
  onSuccessUpload,

  // DEV OPTION
  simulateUpload = false
}) => {
  const successFiles = [];
  const failedFiles = [];
  const { apiRoot, useCUEUpload } = _config;

  setUploadStatusMsg?.('Uploading...');
  setUploadFlag?.(true);

  const validateFile = (file) => {
    let valid = false;
    if (file?.name?.match(/\.([^\.]+)$/) !== null) {
      const ext = file.name.match(/\.([^\.]+)$/)[1];
      if (!ext.match(/exe/gi)) valid = true;
    }
    return valid;
  };

  /**
   * DEV SIMULATION MODE
   * I am leaving it here as this task might need some more update with error handling in the future sprints
   */
  const simulateUploadFileAsync = (file) => {
    return new Promise((resolve, reject) => {
      let percent = 0;
      const startTime = Date.now();

      const shouldFail = Math.random() < 0.25;

      setUploadProgress?.((prev) => ({
        ...prev,
        [file.name]: {
          percent: 0,
          etaSeconds: 5,
          phase: "uploading"
        }
      }));

      const interval = setInterval(() => {
        const increment = Math.floor(Math.random() * 15) + 5;
        percent = Math.min(percent + increment, 100);

        const elapsedSeconds = (Date.now() - startTime) / 1000;
        const speed = percent / elapsedSeconds; // % per second
        const etaSeconds = percent >= 100 ? 0 : Math.ceil((100 - percent) / speed);

        setUploadProgress?.((prev) => ({
          ...prev,
          [file.name]: {
            percent,
            etaSeconds,
            phase: percent >= 100 ? "processing" : "uploading"
          }
        }));

        // simulate failure
        if (shouldFail && percent > 60) {
          clearInterval(interval);

          setUploadProgress?.((prev) => ({
            ...prev,
            [file.name]: {
              percent,
              etaSeconds: 0,
              phase: "failed"
            }
          }));

          reject(new Error(`Upload failed for ${file.name}`));
          return;
        }

        if (percent >= 100) {
          clearInterval(interval);

          setTimeout(() => {
            setUploadProgress?.((prev) => ({
              ...prev,
              [file.name]: {
                percent: 100,
                etaSeconds: 0,
                phase: "completed"
              }
            }));

            resolve(file.name);
          }, 400);
        }
      }, 500);
    });
  };

  
  
  const uploadFileAsync = (file) => {
    return new Promise((resolve, reject) => {
      const updateProgress = (progress, fileObj) => {
        setUploadProgress?.((prev) => ({
          ...prev,
          [fileObj.name]: {
            percent: progress?.percent ?? 0,
            etaSeconds: progress?.etaSeconds ?? null,
            phase:
              progress?.phase === 'upload' ? 'uploading...' :
              progress?.phase ?? 'uploading...'
          }
        }));
      };

      const mappedCategory =
        typeof categoryMap?.[controlId] !== 'undefined'
          ? categoryMap[controlId]
          : categoryType || '';

      const payload = {
        fileObj: file,
        authToken: loadToken()?.token,
        apiEndpoint: `${apiRoot}data/upload/${uploadType}/getUrl`,
        endpointParams:
          uploadType === 'form'
            ? { file_category: mappedCategory }
            : { conversation_id: conversationId }
      };

      if (submissionId) {
        payload.submissionId = submissionId;
      }

      const upload =
        useCUEUpload?.toLowerCase?.() === 'false'
          ? new LocalUpload()
          : new CueFileUtility();

      upload
        .uploadFile(payload, updateProgress)
        .then(async (resp) => {
          const error =
            resp?.data?.error ||
            resp?.error ||
            resp?.data?.[0]?.error;

          if (error) {
            console.error(`Error uploading file ${file.name}: ${error}`);

            setUploadProgress?.((prev) => ({
              ...prev,
              [file.name]: {
                percent: prev?.[file.name]?.percent ?? 0,
                etaSeconds: null,
                phase: 'failed'
              }
            }));

            reject({
              fileName: file.name,
              error: error || 'Upload failed due to an unknown error'
            });
            return;
          }

          try {
            if (onSuccessUpload) {
              await onSuccessUpload(resp, file);
            }

            setUploadProgress?.((prev) => ({
              ...prev,
              [file.name]: {
                percent: 100,
                etaSeconds: 0,
                phase: 'completed'
              }
            }));

            resolve(file.name);
          } catch (hookErr) {
            console.error(`Post-upload handler failed for ${file.name}:`, hookErr);

            setUploadProgress?.((prev) => ({
              ...prev,
              [file.name]: {
                percent: prev?.[file.name]?.percent ?? 100,
                etaSeconds: null,
                phase: 'failed'
              }
            }));

            reject({
              fileName: file.name,
              error: hookErr?.message || 'Post-upload processing failed'
            });
          }
        })
        .catch((err) => {
          console.error(`Error uploading file ${file.name}: ${err}`);

          setUploadProgress?.((prev) => ({
            ...prev,
            [file.name]: {
              percent: prev?.[file.name]?.percent ?? 0,
              etaSeconds: null,
              phase: 'failed'
            }
          }));

          reject({
            fileName: file.name,
            error: err?.message || 'Network or server error during upload'
          });
        });
    });
  };

  const uploadPromises = [...files].map((file) => {
    if (validateFile(file)) {
      const uploader = simulateUpload ? simulateUploadFileAsync : uploadFileAsync;

      return uploader(file)
        .then((fileName) => successFiles.push(fileName))
        .catch((fileError) => failedFiles.push(fileError));
    } else {
      failedFiles.push({
        fileName: file.name,
        error: 'invalid file type'
      });
      return Promise.resolve();
    }
  });

  await Promise.all(uploadPromises);

  setUploadResults?.({
    success: successFiles,
    failed: failedFiles
  });

  setUploadFlag?.(false);
  setUploadStatusMsg?.('Upload Complete');

  setTimeout(() => {
    setUploadProgress?.((prev) => {
      const updated = {};

      Object.entries(prev).forEach(([fileName, data]) => {
        if (data.phase !== 'completed') {
          updated[fileName] = data;
        }
      });

      return updated;
    });
  }, 1500);

  setUploadFileFlag?.((prev) => !prev);
  setShowUploadSummaryModal?.(true);
  clearFiles?.();
  setUploadStatusMsg?.('No files selected');

  return {
    success: successFiles,
    failed: failedFiles
  };
};