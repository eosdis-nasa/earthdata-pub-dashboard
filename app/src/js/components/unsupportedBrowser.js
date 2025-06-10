'use strict';
import React from 'react';
import Tophat2 from './Tophat/top_hat';
import mainLogo from '../../assets/images/nasa-logo.svg';

class UnsupportedBrowser extends React.Component {
  render () {
    return (
      <div>
        <Tophat2 />
        <div className='header' aria-label="Header">
        <div className='row'>
          <h1 className='logo' aria-label="Earthdata pub logo"><img alt="Logo" src={mainLogo} /><div>EDPub</div></h1>
        </div>
      </div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '5em', marginBottom: '0' }}>Unsupported Browser</h1>
          <p style={{ fontSize: '2em' }}>You are attempting to access EDPUB with an unsupported browser. Please use an alternative browser for access.</p>
        </div>
      </div>
    );
  }
}

export default UnsupportedBrowser;
