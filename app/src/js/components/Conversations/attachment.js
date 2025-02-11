'use strict';
import React, { useImperativeHandle } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faFile, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { handleUpload } from '../../utils/upload';

export const DisplayAttachmentButton = ({ fileName, removeFileHandler }) => {
    console.log("Rendering File:", fileName); // Debugging step
    return (
        <button type="button" className='attachment-display-button'>
            <FontAwesomeIcon icon={faFile} style={{ paddingRight: "10px" }} />
            {fileName}
            <FontAwesomeIcon icon={faTimesCircle} style={{ paddingLeft: "10px" }} onClick={() => removeFileHandler(fileName)} />
        </button>
    );
};

export const AddAttachmentButton = ({ conversationId, uploadedFilesRef, setUploadedFiles }) => {
    useImperativeHandle(uploadedFilesRef, () => ({
        getUploadedFiles: () => uploadedFiles
    }));

    let uploadedFiles = new Set();

    const handleChange = async (e) => {
        e.preventDefault();
        const newFiles = Array.from(e.target.files).map(file => {
            const sanitizedFile = new File([file], file.name.replace(/,/g, "_"), { type: file.type });
            return sanitizedFile;
        });

        uploadedFiles = new Set([...uploadedFiles, ...newFiles]);

        console.log("Before Upload:", uploadedFiles); // Debugging step

        const resp = await handleUpload({
            files: [...uploadedFiles],
            conversationId
        });

        console.log("After Upload (from API):", resp.success); // Debugging step

        // Store the actual files, not just names
        setUploadedFiles((currentState) => 
            new Set([...currentState, ...resp.success]) // Keep full file object
        );
    };

    const clickFileTypeInput = () => {
        document.getElementById('hiddenFileInputType')?.click();
    };

    return (
        <>
            <input 
                id="hiddenFileInputType"
                type="file" 
                onChange={(e) => handleChange(e)}
                style={{ display: "none" }}
                multiple 
            />
            <button type="button" className="button button--attachment" onClick={clickFileTypeInput}
                style={{ backgroundColor: "#158749", color: "white", padding: "8px" }}>
                <FontAwesomeIcon icon={faPaperclip} />
            </button>
        </>
    );
};
