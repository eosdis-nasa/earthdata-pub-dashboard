'use strict';

import React from 'react';
import PropTypes from 'prop-types';

class Footer extends React.Component {
  constructor () {
    super();
    this.displayName = 'Footer';
  }

  render () {
    const { authenticated } = this.props.api;
    const { warning, versionNumber } = this.props.apiVersion;

    let versionWarning;
    if (warning) { versionWarning = <h2 className='api__warning'><span className="warning-icon"></span>Warning: { warning }</h2>; }

    return (
      <div className='footer'>
        <div className='api__summary' role="contentinfo" aria-label="Earthdata Pub API Version">
          { authenticated &&
            <h2 className='api__version'>Earthdata Pub API Version: { versionNumber }</h2>
          }
          { versionWarning }
        </div>
      </div>
    );
  }
}

Footer.propTypes = {
  api: PropTypes.object,
  apiVersion: PropTypes.object
};

export default Footer;
