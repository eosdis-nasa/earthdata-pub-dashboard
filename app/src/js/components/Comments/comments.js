'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  getRequest,
  replyConversation
} from '../../actions';

class Comment extends React.Component {
  constructor () {
    super();
    this.displayName = 'Comment';
    this.state = { textRef: React.createRef() };
  }

  componentDidMount () {
    const search = this.props.location.search.split('=');
    const requestId = search[1].replace(/&step/g, '');
    const { dispatch } = this.props;
    dispatch(getRequest(requestId));
  }

  getFormalName (str) {
    if (typeof str === 'undefined') return '';
    const count = (str.match(/_/g) || []).length;
    if (count > 0) {
      str = str.replace(/_/g, ' ');
    }
    const words = str.split(' ');
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }
    return words.join(' ');
  }

  formatComments () {
    if (document.querySelectorAll('textarea#comment')[0].value !== '') {
      document.querySelectorAll('textarea#comment')[0].placeholder = 'Enter a comment';
      document.querySelectorAll('textarea#comment')[0].classList.remove('required');
    }
  }

  hasStepData () {
    if (typeof this.props.requests !== 'undefined' &&
    typeof this.props.requests.detail.data !== 'undefined' &&
    typeof this.props.requests.detail.data.step_data !== 'undefined') {
      return true;
    } else {
      return false;
    }
  }

  reply (requestName, id, stepName) {
    const { dispatch } = this.props;
    if (this.state.textRef.current.value !== '') {
      const date = new Date();
      const datetime = date.toLocaleString();
      const comment = `${datetime} - ${this.state.textRef.current.value}`;
      const reply = `${requestName} - Step: ${stepName}, Comment: ${comment}`;
      const resp = reply.replace(/[\n\t\r\'\"]/g, '\\$&');
      const payload = { conversation_id: id, text: resp };
      dispatch(replyConversation(payload));
      document.getElementById('previously-saved').innerHTML += `${datetime} - ${this.state.textRef.current.value}<br>`;
      this.state.textRef.current.value = '';
      document.querySelectorAll('button.button--reply')[0].classList.add('hidden');
    }
  }

  render () {
    const search = this.props.location.search.split('=');
    const requestId = search[1].replace(/&step/g, '');
    const step = search[2];
    let stepName = this.getFormalName(step);
    let request = '';
    let conversationId = '';
    let requestName = '';
    if (this.hasStepData()) {
      request = this.props.requests.detail.data;
      if (request.step_data.type === 'review') {
        if (this.props.requests.detail.data.forms !== null) {
          if (step === undefined) {
            stepName = this.getFormalName(this.props.requests.detail.data.step_name);
          }
          if (this.props.requests.detail.data.form_data.data_product_name_value) {
            requestName = this.props.requests.detail.data.form_data.data_product_name_value;
          } else {
            requestName = requestId;
          }
        }
        conversationId = this.props.requests.detail.data.conversation_id;
      }
    }

    return (
        <section className='page_section'>
            {typeof requestId !== 'undefined' &&
              <form className='flex__column flex__item--grow-1'
                onSubmit={(e) => { e.preventDefault(); this.reply(requestName, conversationId, stepName); }}>
                <span id='previously-saved' style={{ padding: '0.3em 2em 0.4em 0.7em' }}></span>
                <textarea placeholder='Enter a comment'
                  ref={this.state.textRef}
                  id='comment'
                  aria-label="Enter a comment"
                  title="Enter a comment"
                  onChange={(e) => { e.preventDefault(); this.formatComments(); document.querySelectorAll('button.button--reply')[0].classList.remove('hidden'); }}
                  ></textarea>
                <div style={{ minHeight: '40px' }}>
                  <button type='submit'
                    className='button button--reply form-group__element--right button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'>
                    Save Comment
                  </button>
                </div>
              </form>
            }
        </section>
    );
  }
}

Comment.propTypes = {
  match: PropTypes.object,
  dispatch: PropTypes.func,
  requests: PropTypes.object,
  logs: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  privileges: PropTypes.object,
  params: PropTypes.object
};

export default withRouter(connect(state => ({
  requests: state.requests,
  privileges: state.api.tokens.privileges,
  logs: state.logs
}))(Comment));
