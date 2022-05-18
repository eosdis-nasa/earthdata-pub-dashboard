'use strict';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import DefaultModal from '../Modal/modal';

export let showModal = false;
export let request = '';

document.addEventListener('sendToMeditor:click', function (e) {
  request = e.detail.request;
  e.preventDefault();
  showModal = true;
}, false);

class Meditor extends React.Component {
  constructor () {
    super();
    showModal = false;
    this.state = { show: false };
    this.onClose = this.onClose.bind(this);
    this.onConfirm = this.onConfirm.bind(this);
  }

  onClose (e) {
    showModal = false;
    this.setState(state => ({ show: false }));
  }

  onConfirm (e) {
    showModal = false;
    this.setState(state => ({ show: false }));
    window.open(
      request,
      '_blank'
    );
  }

  render () {
    return <section>
        <DefaultModal
          className='mEditorModal'
          onCancel={this.onClose}
          onCloseModal={this.onClose}
          onConfirm={this.onConfirm}
          title={'Continue to mEditor?'}
          showModal={showModal}
        />
      </section>;
  }
}

export default withRouter(connect(state => ({
  show: state.show
}))(Meditor));
