'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

class NotFound extends React.Component {
  constructor () {
    super();
    this.displayName = '404';
  }

  render () {
    return (
      <div className='page__404' style={{textAlign: "center"}}>
        <h1 style={{fontSize: "10em", marginBottom: "0"}}>404</h1>
        <p style={{fontSize: "5em"}}>Page Not Found</p>
      </div>
    );
  }
}

export default withRouter(connect(state => state)(NotFound));
