'use strict';
import React, { useImperativeHandle } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faFile, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { handleUpload } from '../../utils/upload';

export const DisplayAttachmentButton = ({fileName, removeFileHandler}) => {
    return (
        <button type="button" className='attachment-display-button'>
            <FontAwesomeIcon icon={faFile}  style={{paddingRight: "10px"}}/>
            {fileName}
            <FontAwesomeIcon icon={faTimesCircle} style={{paddingLeft: "10px"}} onClick={(e) => {removeFileHandler(fileName)}}/>
        </button>
    );
}

export const AddAttachmentButton = ({customRequestId, uploadedFilesRef, setUploadedFiles}) => {
    useImperativeHandle(uploadedFilesRef, () => ({
        getUploadedFiles: () => uploadedFiles
    }));

    let uploadedFiles = new Set([]);

    const handleChange = async (e) => {
        e.preventDefault();
        uploadedFiles = new Set([...uploadedFiles, ...Array.from(e.target.files)]);
        const resp = await handleUpload({
            files: uploadedFiles,
            requestId: customRequestId
        });
        setUploadedFiles((currentState) => new Set([...currentState, ...resp.failed]));
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
        style={{display: "none"}}
        multiple 
        />
        <button type="button" className="button button--attachment" onClick={clickFileTypeInput}
        style={{backgroundColor: "#158749", color: "white", padding: "8px" }}>
            <FontAwesomeIcon icon={faPaperclip} />
        </button>
        </>

    );
}