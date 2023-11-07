'use strict';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import DefaultModal from '../Modal/modal';

export let showModal = false;
export let request = '';
export let link = '';

document.addEventListener('sendToMeditor:click', function (e) {
  request = e.detail.request;
  link = e.detail.link;
  e.preventDefault();
  if (localStorage.getItem('dontShowAgain') === null || localStorage.getItem('dontShowAgain') === 'false') {
    showModal = true;
  } else {
    window.open(
      request,
      '_blank'
    );
    window.location.href = link;
  }
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
    window.location.href = link;
  }

  callback () {
    if (document.getElementById('dontShowAgain').checked) {
      localStorage.setItem('dontShowAgain', 'true');
    } else {
      localStorage.setItem('dontShowAgain', 'false');
    }
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
          dontShowAgainCheckbox={true}
          dontShowAgainVerbage='Do not show this again'
          dontShowAgainCallback={this.callback}
          dontShowAgainClass={'dontShowAgainClass'}
          children={'A new tab will open to direct you to mEditor. Do you want to continue?'}
        />
      </section>;
  }
}

export default withRouter(connect(state => ({
  show: state.show
}))(Meditor));
