'use strict';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faFile, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { handleUpload } from '../../utils/upload';

export const DisplayAttachmentButton = ({fileName}) => {
    return (
        <button className='attachment-display-button'>
            <FontAwesomeIcon icon={faFile}  style={{paddingRight: "10px"}}/>
            {fileName}
            <FontAwesomeIcon icon={faTimesCircle} style={{paddingLeft: "10px"}}/>
        </button>
    );
}

export const AddAttachmentButton = ({customRequestId}) => {

    let uploadedFiles = [];

    const handleChange = async (e) => {
        e.preventDefault();
        uploadedFiles = uploadedFiles.concat(Array.from(e.target.files));
        await handleUpload({
            files: uploadedFiles,
            requestId: customRequestId
        });
    };

    const clickFileTypeInput = () => {
        document.getElementById('hiddenFileInputType')?.click();
    };

    return (
        <>
        <div style={{display: "flex", textAlign: "left"}}>
        <div style={{width: "95%"}}>
        {console.log(uploadedFiles)}
        {
            uploadedFiles.map((elem) =>
                <DisplayAttachmentButton fileName="Test.png"/>
            )
        }
        </div>
        <div style={{width: "5%"}}>
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
        </div>
        </div>
        </>

    );
}