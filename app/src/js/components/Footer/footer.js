'use strict';

import React from 'react';
import PropTypes from 'prop-types';

class Footer extends React.Component {
  constructor () {
    super();
    this.displayName = 'Footer';
  }

  handler () {
    this.feedback.showForm();
  }

  render () {
    const { authenticated } = this.props.api;
    const { warning, versionNumber } = this.props.apiVersion;

    let versionWarning;
    if (warning) { versionWarning = <h2 className='api__warning'><span className="warning-icon"></span>Warning: { warning }</h2>; }

    return (
      <footer className="mt-auto">
        <div className="container">
          <div className='api__summary' role="contentinfo" aria-label="Earthdata Pub API Version">
            { authenticated &&
              <h2 className='api__version'>Earthdata Pub API Version: { versionNumber }</h2>
            }
            { versionWarning }
          </div>
          <nav role="navigation">
            <ul className="footer-links">
              <li>NASA Official: Justin Rice</li>
              <li><a href="https://www.nasa.gov/FOIA/index.html">FOIA</a></li>
              <li><a href="https://www.nasa.gov/about/highlights/HP_Privacy.html">NASA Privacy Policy</a></li>
              <li><a href="https://www.usa.gov/">USA.gov</a></li>
              <li><a onClick={() => this.handler}>Feedback</a></li>
            </ul>
          </nav>
        </div>
      </footer>
    );
  }
}

Footer.propTypes = {
  api: PropTypes.object,
  apiVersion: PropTypes.object
};

export default Footer;
