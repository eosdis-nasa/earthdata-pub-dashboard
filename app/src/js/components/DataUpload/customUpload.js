'use strict';
import React from 'react';

export const CustomUpload = ({customComponent, conversationId, uploadedFilesRef, setUploadedFiles}) => {
  return (
    <>{customComponent({conversationId, uploadedFilesRef, setUploadedFiles})}</>
  );
};