'use strict';
import React, { useState, useImperativeHandle } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { handleUpload } from '../../utils/upload';

export const Attachment = () => {

    let uploadedFiles = [];

    const handleChange = async (e) => {
        e.preventDefault();
        uploadedFiles = uploadedFiles.concat(Array.from(e.target.files));
        await handleUpload({
            files: uploadedFiles,
            requestId: 'test-id'
        });
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
        <button className="button button--attachment" onClick={clickFileTypeInput}
        style={{backgroundColor: "#158749", color: "white", padding: "8px" }}>
            <FontAwesomeIcon icon={faPaperclip} />
        </button>
        </>

    );
}