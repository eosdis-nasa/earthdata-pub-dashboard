'use strict';
import React from 'react';
import Tophat2 from './Tophat/top_hat';
import mainLogo from '../../assets/images/nasa-logo.svg';

class UnsupportedBrowser extends React.Component {
  render () {
    return (
      <div>
        <Tophat2 />
        <div className='header'>
        <div className='row'>
          <div className='logo'><img alt="" src={mainLogo} /><div>EDPub</div></div>
        </div>
      </div>
        <main id="main-content" style={{ textAlign: 'center' }} tabIndex={-1}>
          <h1 style={{ fontSize: '5em', marginBottom: '0' }}>Unsupported Browser</h1>
          <p style={{ fontSize: '2em' }}>You are attempting to access EDPUB with an unsupported browser. Please use an alternative browser for access.</p>
        </main>
      </div>
    );
  }
}

export default UnsupportedBrowser;
