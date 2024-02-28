'use strict';
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

class Error extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      code: '',
      error: ''
    };
  }

  componentDidMount () {
    const { code, error } = this.props.router.location.query;
    this.setState({ code, error: decodeURIComponent(decodeURIComponent(error)) });
  }

  render () {
    return (
      <div className='page__404' style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '10em', marginBottom: '0' }}>Error</h1>
        <p style={{ fontSize: '5em' }}> {this.state.error}</p>
      </div>
    );
  }
}

Error.propTypes = {
  match: PropTypes.object,
  router: PropTypes.object
};

export default withRouter(connect(state => state)(Error));
