import React from 'react';
import mainLogo from '../../../assets/images/nasa-logo.svg';

const BrandLoading = () => (
  <div className="brand-loading" role="status">
    <img src={mainLogo} alt="" />
    <p className="brand-loading__name">EDPub</p>
    <span className="brand-loading__spinner" aria-hidden="true" />
    <p className="brand-loading__status">Loading...</p>
  </div>
);

export default BrandLoading;
