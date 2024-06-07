'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { getMFAStatus } from '../../actions';


class MfaRedirect extends React.Component {
  constructor (props) {
    super(props);
    this.state = { redirectURL: 'Initial State'};
  }

  async componentDidMount () {
    const { dispatch } = this.props;
    const redirectURL = await dispatch(getMFAStatus());
    console.log(redirectURL);
    this.setState({redirectURL: redirectURL});
  }

  render () {
    return (
      <div className='page__404' style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: '10em', marginBottom: '0' }}>{this.state.redirectURL}</h3>
      </div>
    );
  }
}

MfaRedirect.propTypes = {
    dispatch: PropTypes.func
  };

export default withRouter(connect(state => state)(MfaRedirect));
