'use strict';
import React from 'react';

export const CustomUpload = ({customComponent, customRequestId, uploadedFilesRef, setUploadedFiles}) => {
  return (
    <>{customComponent({customRequestId, uploadedFilesRef, setUploadedFiles})}</>
  );
};