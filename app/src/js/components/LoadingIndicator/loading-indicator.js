'use strict';
import React from 'react';

const Loading = () => (
  <div className="app-loading" role="status">
    <span className="app-loading__spinner" aria-hidden="true" />
    <p className="app-loading__status">Loading...</p>
  </div>
);

export default Loading;
