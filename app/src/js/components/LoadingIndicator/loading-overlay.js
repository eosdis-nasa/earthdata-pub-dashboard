import React from 'react';
import Loading from './loading-indicator';

const LoadingOverlay = () => (
  <div className='loading-overlay'
    onClick={(e) => e.stopPropagation() }>
    <Loading />
  </div>
);

export default LoadingOverlay;
