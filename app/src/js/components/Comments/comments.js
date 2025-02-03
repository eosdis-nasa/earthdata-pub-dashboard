'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  getRequest,
  replyConversation,
  getForm,
  getStepConversation
} from '../../actions';
import Loading from '../LoadingIndicator/loading-indicator';
import { requestPrivileges } from '../../utils/privileges';
import { NewNoteVisibility } from '../Conversations/visibility';
import { AddAttachmentButton, DisplayAttachmentButton } from '../Conversations/attachment';
import { CustomUpload } from '../DataUpload/customUpload';
import localUpload from '@edpub/upload-utility';
import Tooltip from '@mui/material/Tooltip';

class Comment extends React.Component {
  constructor() {
    super();
    this.state = { 
      textRef: React.createRef(),
      visibilityRef: React.createRef(),
      uploadedFilesRef: React.createRef(),
      uploadedFiles: [],
      existingNotes: []
    };

    this.appendToUploadedFiles = this.appendToUploadedFiles.bind(this);
    this.handleRemoveFile = this.handleRemoveFile.bind(this);
    this.getStepComments = this.getStepComments.bind(this);
    this.getReviewStepName = this.getReviewStepName.bind(this);
    this.handleDownload = this.handleDownload.bind(this);
  }

  async componentDidMount() {
    const search = this.props.location.search.split('=');
    let requestId = '';
    if (search[1] !== undefined) {
      requestId = search[1].replace(/&step/g, '');
    }
    const { dispatch } = this.props;
    await dispatch(getRequest(requestId));
    await this.getReviewStepName(search);
  }

  async getReviewStepName(search) {
    const { dispatch } = this.props;
    const { formId } = this.props.match.params;
    const step = search[2];
    await dispatch(getForm(formId, this.props.requests.detail.data.daac_id));
    if (this.props.requests.detail.data.conversation_id) {
      this.state.reviewStepName = `${this.props.forms.map[formId].data.short_name}_form_review`;
      if ( typeof this.props.requests.detail.data.step_name !== 'undefined' && typeof step === 'undefined'){
        this.state.reviewStepName = this.props.requests.detail.data.step_name;
      } else if (typeof this.props.forms.map[formId].data.short_name === 'undefined' && typeof step !== 'undefined') {
        this.state.reviewStepName = step;
      } else if (typeof this.props.forms.map[formId].data.short_name === 'undefined') {
        this.state.reviewStepName = '';
      }
      const payload = { conversation_id: this.props.requests.detail.data.conversation_id, level: true, step_name: this.state.reviewStepName };
      await this.getStepComments(payload);
    }
  }

  async getStepComments(payload) {
    const { dispatch } = this.props;
    await dispatch(getStepConversation(payload)).then(() => {
      const notesArr = [];
      this.props.conversations.conversation.data.notes.forEach((noteElem) => {
        const note = noteElem.text.split('Comment: ')[1];
        const author = noteElem.from.name;
        let viewers = [
          ...(noteElem.viewers.users?.map((user) => user.name) || []),
          ...(noteElem.viewers.roles?.map((role) => role.name) || [])
        ];

        const viewer_str = viewers?.length ? `, Viewers: ${viewers.join(", ")}` : "";
        notesArr.push({id: noteElem.id, note, author, viewer_str, attachments: noteElem.attachments});
      })
      this.setState({existingNotes: notesArr.reverse()});
    });
  }

  appendToUploadedFiles(newFiles) {
    this.setState({uploadedFiles: new Set([...this.state.uploadedFiles, ...newFiles])});
    return this.state.uploadedFiles;
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
    return (typeof this.props?.requests?.detail?.data?.step_data !== 'undefined');
  }

  handleDownload ({noteId, attachment}) {
    const download = new localUpload();
    const { apiRoot } = _config;
    download.downloadFile(`attachments/${noteId}/${attachment}`, `${apiRoot}data/upload/downloadUrl`, loadToken().token).then((resp) => {
        let error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error
        if (error) {
          console.log(`An error has occurred: ${error}.`);
        }
      })
  }

  async reply(requestName, id, stepName, step) {
    const { dispatch } = this.props;
    const attachments = [...this.state.uploadedFiles];
    if (this.state.textRef.current.value !== '' || attachments.length > 0) {
      const date = new Date();
      const datetime = date.toLocaleString();
      const comment = `${datetime} - ${this.state.textRef.current.value}`;
      const reply = `${requestName} - Step: ${stepName}, Comment: ${comment}`;
      const resp = reply.replace(/[\n\t\r\'\"]/g, '\\$&');
      const current_user = JSON.parse(window.localStorage.getItem('auth-user'));
      const { viewer_users, viewer_roles, viewer_names } = this.state.visibilityRef.current.getVisibility();
      // ensure the person adding the comment is a viewer if they've limited the note
      if (!viewer_users.includes(current_user.id) && (viewer_users.length || viewer_roles.length)){
        viewer_users.unshift(current_user.id);
        viewer_names.unshift(current_user.name);
      }
      const payload = { conversation_id: id, text: resp, step_name: step , viewer_users, viewer_roles, attachments};
      await dispatch(replyConversation(payload));
      localStorage.setItem(`${this.props.requests.detail.data.id}_${step}`, 'saved');
      this.setState({
        existingNotes: [
          ...this.state.existingNotes,
          {
            note: resp.split('Comment: ')[1],
            author: current_user.name,
            viewer_str: viewer_names.length > 0 ? `, Viewers: ${viewer_names.join(', ')}`: '',
            attachments
          }
        ],
        uploadedFiles: []
      });
      this.state.textRef.current.value = '';
      this.state.visibilityRef?.current?.resetIdMap();
    }
  }

  handleRemoveFile(fileName) {
    //Have to ensure a rerender with the state update
    this.state.uploadedFiles.delete(fileName);
    this.setState({uploadedFiles: this.state.uploadedFiles});
  }

  render() {
    const { dispatch, privileges } = this.props;
    let reviewable = false;
    let sameFormAsStep = false;
    let request = this.props.requests.detail.data;
    let requestId = request ? request.id : '';
    let step = request?.step_name;
    let stepName = this.getFormalName(step);
    let { canReview } = requestPrivileges(privileges, step);
    let conversationId = '';
    let requestName = '';
    const formId = this.props.match.params.formId;
    let formName = '';    

    if (this.hasStepData() && request !== undefined) {
      if (this.props.forms.map !== undefined && this.props.forms.map[formId] !== undefined && this.props.forms.map[formId].data !== undefined) {
        formName = this.props.forms.map[formId].data.short_name;
        if (this.props.requests.detail.data.forms !== null) {
          if (this.props.requests.detail.data.form_data?.data_product_name_value) {
            requestName = this.props.requests.detail.data.form_data.data_product_name_value;
          } else {
            requestName = requestId;
          }
        }
        conversationId = this.props.requests.detail.data.conversation_id;
        if (step?.match(/close/g)) {
          sameFormAsStep = false;
          canReview = false;
        }
        if (step === `${formName}_form`) {
          sameFormAsStep = true;
          canReview = false;
        } else if (step?.match(/form_(.*_)?review/g)) {
          if (canReview) {
            reviewable = true;
          }
          const regexStr = new RegExp(`${formName}_form_(.*_)?review`, 'g');
          if (step?.match(regexStr)) {
            sameFormAsStep = true;
          }
        } else if (window.location.href.match(/approval/g)) {
          reviewable = true;
          sameFormAsStep = true;
        }
      }
    }
    if (!request || request.inflight || !this.props.conversations.conversation.data.notes) {
      return <Loading />;
    } else {
      if (conversationId === '') {
        conversationId = this.props.conversations.conversation.data.id;
      }
      return (
        <section className='page_section'>
          {typeof requestId !== 'undefined' &&
            <form className='flex__column flex__item--grow-1'
              onSubmit={(e) => { e.preventDefault(); this.reply(requestName, conversationId, stepName, step); }}>
              <div id='previously-saved' style={{ padding: '0.3em 2em 0.4em 0.7em' }}>
                {
                  this.state.existingNotes.map((note, idx) => {
                    {console.log('note', note)};
                    return(
                      <div key={idx}>
                        {`${note.note}, From: ${note.author}${note.viewer_str}`}
                        {note.attachments && ', Attachments: '}
                        { note?.attachments?.map((attachment, idx) => {
                          return (
                            <>
                            {idx > 0 ? ', ' : ' '}
                            { note.id ?
                              <a onClick={(e) => this.handleDownload({noteId: note.id, attachment})}>{attachment}</a> :
                              <Tooltip title='Attachment temporarily unavailable.'>
                                <a>{attachment}</a>
                              </Tooltip>
                            }
                            </>
                          );
                        })}
                        <br />
                      </div>
                    );
                  })
                }
              </div>
              {requestId !== '' && reviewable && sameFormAsStep
                ? <><textarea placeholder='Enter a comment'
                  ref={this.state.textRef}
                  id='comment'
                  aria-label="Enter a comment"
                  title="Enter a comment"
                  onChange={(e) => { e.preventDefault(); this.formatComments();}}
                ></textarea>
                  <NewNoteVisibility dispatch={dispatch} privileges={privileges} conversationId={conversationId} visibilityRef={this.state.visibilityRef}/>
                  <div>
                  {
                      [...this.state.uploadedFiles].map((fileName) =>
                          <DisplayAttachmentButton key={fileName} fileName={fileName} removeFileHandler={this.handleRemoveFile}/>
                      )
                  }
                  </div>
                  <div style={{textAlign: "right"}}>
                    <CustomUpload customComponent={AddAttachmentButton}
                    conversationId={conversationId}
                    uploadedFilesRef={this.state.uploadedFilesRef}
                    appendToUploadedFiles={this.appendToUploadedFiles}/>
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
