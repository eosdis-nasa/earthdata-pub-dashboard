'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  getRequest,
  replyConversation,
  getForm,
  getConversations
} from '../../actions';
import Loading from '../LoadingIndicator/loading-indicator';
import { requestPrivileges, formPrivileges } from '../../utils/privileges';

class Comment extends React.Component {
  constructor() {
    super();
    this.displayName = 'Comment';
    this.state = { textRef: React.createRef() };
  }

  async componentDidMount() {
    const search = this.props.location.search.split('=');
    let requestId = '';
    if (search[1] !== undefined) {
      requestId = search[1].replace(/&step/g, '');
    }
    const step = search[2];
    const { dispatch } = this.props;
    const { formId } = this.props.match.params;
    await dispatch(getRequest(requestId));
    await dispatch(getForm(formId, this.props.requests.detail.data.daac_id));
    let reviewStepName = `${this.props.forms.map[formId].data.short_name}_form_review`;
    if (this.props.requests.detail.data.conversation_id) {
      if (typeof this.props.forms.map[formId].data.short_name === 'undefined' && typeof step !== 'undefined') {
        reviewStepName = step;
      } else if (typeof this.props.forms.map[formId].data.short_name === 'undefined') {
        reviewStepName = '';
      }
      const payload = { conversation_id: this.props.requests.detail.data.conversation_id, level: true, step_name: reviewStepName };
      await dispatch(getConversations(payload)).then(() => {
        for (const ea in this.props.conversations.list.data.notes) {
          const note = this.props.conversations.list.data.notes[ea].text.split('Comment: ')[1];
          const author = this.props.conversations.list.data.notes[ea].from.name;
          if (document.getElementById('previously-saved') !== null && typeof note !== 'undefined') {
            document.getElementById('previously-saved').innerHTML += `${note}, From: ${author}<br>`;
          }
        }
      });
    }
  }

  getFormalName(str) {
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

  formatComments() {
    if (document.querySelectorAll('textarea#comment') !== undefined && document.querySelectorAll('textarea#comment')[0] !== undefined && document.querySelectorAll('textarea#comment')[0].value !== '') {
      document.querySelectorAll('textarea#comment')[0].placeholder = 'Enter a comment';
      document.querySelectorAll('textarea#comment')[0].classList.remove('required');
    }
  }

  hasStepData() {
    if (typeof this.props.requests !== 'undefined' &&
      typeof this.props.requests.detail.data !== 'undefined' &&
      typeof this.props.requests.detail.data.step_data !== 'undefined') {
      return true;
    } else {
      return false;
    }
  }

  reply(requestName, id, stepName, step) {
    const { dispatch } = this.props;
    if (this.state.textRef.current.value !== '') {
      const date = new Date();
      const datetime = date.toLocaleString();
      const comment = `${datetime} - ${this.state.textRef.current.value}`;
      const reply = `${requestName} - Step: ${stepName}, Comment: ${comment}`;
      const resp = reply.replace(/[\n\t\r\'\"]/g, '\\$&');
      const payload = { conversation_id: id, text: resp, step_name: step };
      dispatch(replyConversation(payload));
      const author = JSON.parse(window.localStorage.getItem('auth-user')).name;
      document.getElementById('previously-saved').innerHTML += `${datetime} - ${this.state.textRef.current.value}, From: ${author}<br>`;
      this.state.textRef.current.value = '';
      localStorage.setItem(`${this.props.requests.detail.data.id}_${step}`, 'saved');
      document.querySelectorAll('button.button--reply')[0].classList.add('hidden');
    }
  }

  render() {
    let reviewable = false;
    let { canReview } = requestPrivileges(this.props.privileges);
    let sameFormAsStep = false;
    const search = this.props.location.search.split('=');
    let requestId = '';
    if (search[1] !== undefined) {
      requestId = search[1].replace(/&step/g, '');
    }
    let step = search[2];
    let stepName = this.getFormalName(step);
    let request = '';
    let conversationId = '';
    let requestName = '';
    const formId = this.props.match.params.formId;
    let formName = '';
    request = this.props.requests.detail.data;
    if (this.hasStepData() && request !== undefined) {
      if (this.props.forms.map !== undefined && this.props.forms.map[formId] !== undefined && this.props.forms.map[formId].data !== undefined) {
        formName = this.props.forms.map[formId].data.short_name;
        if (this.props.requests.detail.data.forms !== null) {
          if (step === undefined) {
            step = this.props.requests.detail.data.step_name;
            stepName = this.getFormalName(step);
          }
          if (this.props.requests.detail.data.form_data.data_product_name_value) {
            requestName = this.props.requests.detail.data.form_data.data_product_name_value;
          } else {
            requestName = requestId;
          }
        }
        conversationId = this.props.requests.detail.data.conversation_id;
        if (this.props.requests.detail.data.step_name.match(/close/g)) {
          sameFormAsStep = false;
          canReview = false;
        }
        if (this.props.requests.detail.data.step_name === `${formName}_form`) {
          sameFormAsStep = true;
          canReview = false;
        } else if (this.props.requests.detail.data.step_name.match(/form_review/g)) {
          if (canReview) {
            reviewable = true;
          }
          if (this.props.requests.detail.data.step_name === `${formName}_form_review`) {
            sameFormAsStep = true;
          }
        } else if (window.location.href.match(/approval/g)) {
          reviewable = true;
          sameFormAsStep = true;
        }
      }
    }
    if (!request || request.inflight || !this.props.conversations.list.data.notes) {
      return <Loading />;
    } else {
      if (conversationId === '') {
        conversationId = this.props.conversations.list.data.id;
      }
      return (
        <section className='page_section'>
          {typeof requestId !== 'undefined' &&
            <form className='flex__column flex__item--grow-1'
              onSubmit={(e) => { e.preventDefault(); this.reply(requestName, conversationId, stepName, step); }}>
              <span id='previously-saved' style={{ padding: '0.3em 2em 0.4em 0.7em' }}></span>
              {requestId !== '' && reviewable && sameFormAsStep
                ? <><textarea placeholder='Enter a comment'
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
                  </div></>
                : null
              }
            </form>
          }
        </section>
      );
    }
  }
}

Comment.propTypes = {
  match: PropTypes.object,
  dispatch: PropTypes.func,
  requests: PropTypes.object,
  forms: PropTypes.object,
  conversations: PropTypes.object,
  logs: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  privileges: PropTypes.object,
  params: PropTypes.object
};

export default withRouter(connect(state => ({
  forms: state.forms,
  conversations: state.conversations,
  requests: state.requests,
  privileges: state.api.tokens.privileges,
  logs: state.logs
}))(Comment));
