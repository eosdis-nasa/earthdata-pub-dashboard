'use strict';
import React from 'react';

export const CustomUpload = ({customComponent, customRequestId}) => {
  return (
    <>{customComponent({customRequestId})}</>
  );
};