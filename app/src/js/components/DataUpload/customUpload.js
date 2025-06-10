'use strict';
import React from 'react';

export const CustomUpload = ({customComponent, conversationId, uploadedFilesRef, appendToUploadedFiles}) => {
  return (
    <>{customComponent({conversationId, uploadedFilesRef, appendToUploadedFiles})}</>
  );
};