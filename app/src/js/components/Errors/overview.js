'use strict';
import React from 'react';
import { connect } from 'react-redux';

class ErrorsOverview extends React.Component {
  constructor () {
    super();
    this.displayName = 'ErrorsOverview';
  }

  render () {
    return (
      <div className='page__component'>
        <h2>This is an error overview page</h2>
      </div>
    );
  }
}

export default connect(state => state)(ErrorsOverview);
