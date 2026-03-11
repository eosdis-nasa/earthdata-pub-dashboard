'use strict';

import React, { useImperativeHandle, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPaperclip,
    faFile,
    faTimesCircle,
    faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { handleUpload } from '../../utils/upload';

export const DisplayAttachmentButton = ({ fileName, removeFileHandler }) => {
    return (
        <button type="button" className="attachment-display-button">
            <FontAwesomeIcon icon={faFile} style={{ paddingRight: '10px' }} />
            {fileName}
            <FontAwesomeIcon
                icon={faTimesCircle}
                style={{ paddingLeft: '10px', cursor: 'pointer' }}
                onClick={() => removeFileHandler(fileName)}
            />
        </button>
    );
};

export const AddAttachmentButton = ({
    conversationId,
    uploadedFilesRef,
    appendToUploadedFiles
}) => {
    // Set this to false when you want real upload behavior.
    const SIMULATE_UPLOAD = true;

    const formatETA = (seconds) => {
        if (!seconds) return '0s';

        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        if (mins > 0) {
            return `${mins}m ${secs}s`;
        }

        return `${secs}s`;
    };

    const uploadedFiles = useRef(new Set());

    const [uploadProgress, setUploadProgress] = useState({});
    const [uploadStatusMsg, setUploadStatusMsg] = useState('No files selected');
    const [uploadFlag, setUploadFlag] = useState(false);
    const [uploadResults, setUploadResults] = useState({ success: [], failed: [] });

    useImperativeHandle(uploadedFilesRef, () => ({
        getUploadedFiles: () => [...uploadedFiles.current]
    }));

    const clearFailedProgress = () => {
        setUploadProgress((prev) => {
            const updated = {};

            Object.entries(prev).forEach(([fileName, data]) => {
                if (data.phase !== 'failed') {
                    updated[fileName] = data;
                }
            });

            return updated;
        });
    };

    const hasFailedUploads = Object.values(uploadProgress).some(
        (item) => item.phase === 'failed'
    );

    const handleChange = async (e) => {
        e.preventDefault();

        const newFiles = Array.from(e.target.files || []).map((file) => {
            return new File(
                [file],
                file.name.replace(/,/g, '-'),
                { type: file.type }
            );
        });

        // Clear previous completed progress bars before starting a new upload.
        // Keep failed ones if you still want user to manually close them.
        setUploadProgress((prev) => {
            const updated = {};

            Object.entries(prev).forEach(([fileName, data]) => {
                if (data.phase === 'failed') {
                    updated[fileName] = data;
                }
            });

            return updated;
        });

        setUploadResults({ success: [], failed: [] });

        // Only upload the current selection
        uploadedFiles.current = new Set(newFiles);

        const resp = await handleUpload({
            files: [...uploadedFiles.current],
            conversationId,
            uploadType: 'attachment',
            setUploadStatusMsg,
            setUploadFlag,
            setUploadProgress,
            setUploadResults,
            simulateUpload: SIMULATE_UPLOAD
        });

        appendToUploadedFiles(resp.success);

        // Clear stored file batch after upload finishes
        uploadedFiles.current = new Set();

        // Reset input so same file can be selected again
        e.target.value = '';
    };

    const clickFileTypeInput = () => {
        document.getElementById('hiddenFileInputType')?.click();
    };

    return (
        <>
            <input
                id="hiddenFileInputType"
                type="file"
                onChange={handleChange}
                style={{ display: 'none' }}
                multiple
            />

            <button
                type="button"
                className="button button--attachment"
                onClick={clickFileTypeInput}
                disabled={uploadFlag}
                style={{
                    backgroundColor: '#158749',
                    color: 'white',
                    padding: '8px'
                }}
            >
                <FontAwesomeIcon icon={uploadFlag ? faSpinner : faPaperclip} spin={uploadFlag} />
            </button>

            {Object.keys(uploadProgress).length > 0 && (
                <div style={{ marginTop: '12px', position: 'relative' }}>
                    {hasFailedUploads && (
                        <FontAwesomeIcon
                            icon={faTimesCircle}
                            onClick={clearFailedProgress}
                            style={{
                                position: 'absolute',
                                right: 0,
                                top: -8,
                                cursor: 'pointer',
                                color: '#dc3545',
                                zIndex: 1
                            }}
                            title="Clear failed uploads"
                        />
                    )}

                    {Object.entries(uploadProgress).map(([fileName, progressData]) => {
                        const percent = progressData?.percent ?? 0;
                        const phase = progressData?.phase ?? 'uploading';
                        const etaSeconds = progressData?.etaSeconds;

                        return (
                            <div key={fileName} style={{ marginBottom: '12px' }}>
                                <div style={{ fontSize: '13px', marginBottom: '4px', paddingRight: hasFailedUploads ? '24px' : 0 }}>
                                    <strong>{fileName}</strong>
                                </div>

                                <div
                                    style={{
                                        width: '100%',
                                        height: '10px',
                                        borderRadius: '6px',
                                        backgroundColor: '#e5e5e5',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${percent}%`,
                                            height: '100%',
                                            transition: 'width 0.3s ease',
                                            backgroundColor:
                                                phase === 'failed'
                                                    ? '#dc3545'
                                                    : phase === 'completed'
                                                    ? '#158749'
                                                    : '#2275aa'
                                        }}
                                    />
                                </div>

                               <div style={{ fontSize: '12px', marginTop: '4px', color: '#555' }}>
                                    {percent}% | {phase}
                                    {phase !== 'completed' && phase !== 'failed' && (
                                        <>
                                            {" | "}
                                            {etaSeconds != null ? (
                                                <>Time Remaining: {formatETA(etaSeconds)}</>
                                            ) : (
                                                uploadFlag && (
                                                    <>
                                                        <FontAwesomeIcon
                                                            icon={faSpinner}
                                                            spin
                                                            style={{ marginLeft: '4px', marginRight: '4px' }}
                                                        />
                                                        Calculating Time Remaining...
                                                    </>
                                                )
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* {uploadResults.failed.length > 0 && (
                <div style={{ marginTop: '10px', color: '#dc3545', fontSize: '13px' }}>
                    {uploadResults.failed.map((item, index) => (
                        <div key={index}>
                            Failed: {item.fileName} ({item.error})
                        </div>
                    ))}
                </div>
            )}

            {uploadResults.success.length > 0 && (
                <div style={{ marginTop: '10px', color: '#158749', fontSize: '13px' }}>
                    Uploaded: {uploadResults.success.join(', ')}
                </div>
            )} */}
        </>
    );
};