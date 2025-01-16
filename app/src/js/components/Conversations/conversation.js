'use strict';
import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  getConversation,
  replyConversation,
  addUsersToConversation
} from '../../actions';
import { notePrivileges } from '../../utils/privileges';
import { lastUpdated } from '../../utils/format';
import SearchModal from '../SearchModal';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import LoadingOverlay from '../LoadingIndicator/loading-overlay';
import Note from './note';
import { NewNoteVisibility } from './visibility';
import { CustomUpload } from '../DataUpload/customUpload';
import { AddAttachmentButton, DisplayAttachmentButton } from './attachment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faSortAmountDown, faSortAmountUp } from '@fortawesome/free-solid-svg-icons';


const textRef = React.createRef();

const Conversation = ({ dispatch, conversation, privileges, match }) => {
  const current_user_id = JSON.parse(window.localStorage.getItem('auth-user')).id;
  const { conversationId } = match.params;
  const [showSearch, setShowSearch] = useState(false);
  const [sortLabel, setSortLabel] = useState('Newest First ');
  const [newestFirstFlag, setNewestFirstFlag] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  useEffect(() => {
    dispatch(getConversation(conversationId, true));
  }, []);
  const { data, inflight, meta } = conversation;
  const { subject, notes, participants } = data;
  const { queriedAt } = meta;
  const { canReply, canAddUser } = notePrivileges(privileges);
  const visibilityRef = useRef();
  const uploadedFilesRef = useRef();

  const handleVisibilityReset = () => {
    visibilityRef?.current?.resetIdMap();
  };

  const handleRemoveFile = (fileName) => {
    //Have to ensure a rerender with the state update
    uploadedFiles.delete(fileName);
    setUploadedFiles(new Set([...uploadedFiles]));
  };

  const reply = (dispatch, id) => {
    const { viewer_users, viewer_roles } = visibilityRef.current.getVisibility()
    // ensure the person adding the comment is a viewer if they've limited the note
    if (!viewer_users.includes(current_user_id) && (viewer_users.length || viewer_roles.length)){
      viewer_users.push(current_user_id);
    }
    const resp = encodeURI(textRef.current.value);
    const payload = { 
      conversation_id: id, 
      text: resp,
      viewer_users,
      viewer_roles,
      attachments: [...uploadedFiles]
    };
    dispatch(replyConversation(payload));
    textRef.current.value = '';
    handleVisibilityReset();
    setUploadedFiles([]);
  };

  const cancelCallback = () => setShowSearch(false);
  const submitCallback = (id) => {
    const params = {
      conversation_id: conversationId,
      user_id: id
    };
    dispatch(addUsersToConversation(params));
    setShowSearch(false);
  };

  const searchOptions = {
      entity: 'user',
      submit: submitCallback,
      cancel: cancelCallback
    };

  const breadcrumbConfig = [
    {
      label: 'Dashboard Home',
      href: '/'
    },
    {
      label: 'Conversations',
      href: '/conversations'
    },
    {
      label: data.id || '',
      active: true
    }
  ];

  const toggleOldestFirst = () => {
    setSortLabel('Oldest First ');
    setNewestFirstFlag(false);
  };

  const toggleNewestFirst = () => {
    setSortLabel('Newest First ');
    setNewestFirstFlag(true);
  };

  return (
    <div className='page__content--shortened'>
      <div className='page__component'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <section className='page__section page__section__header-wrapper' style={{display: "flex"}}>
          <div className='page__section__header'>
            <h1 className='heading--large heading--shared-content with-description '>
              Conversation: {subject}
            </h1>
            {lastUpdated(queriedAt)}
          </div>
        </section>
        <div style={{textAlign: "right"}}>
          <label onClick={() => sortLabel === 'Newest First ' ? toggleOldestFirst() : toggleNewestFirst()}>
            {sortLabel}
            <FontAwesomeIcon icon={faSortAmountDown} hidden={newestFirstFlag}/>
            <FontAwesomeIcon icon={faSortAmountUp} hidden={!newestFirstFlag}/>
          </label>
        </div>
        {showSearch && <SearchModal {...searchOptions} />}
        { inflight && <LoadingOverlay /> }
        { notes &&
          <section className='page__section'>
            <section className='page__section flex__item--grow-1'>
              <div className={`flex__column${!newestFirstFlag && '--reverse'}`}>
                <div className='flex__row'>
                  {canReply &&
                    <form className='flex__column flex__item--grow-1'
                      onSubmit={(e) => { e.preventDefault(); reply(dispatch, conversationId); }}
                      style={{marginTop: "25px", marginBottom: "25px"}}>
                      <textarea placeholder='Type your message.'
                        ref={textRef}
                        aria-label="Type your message"
                        title="Type your message"></textarea>
                      <NewNoteVisibility dispatch={dispatch} privileges={privileges} conversationId={conversationId} visibilityRef={visibilityRef}/>
                      <div>
                      {
                          [...uploadedFiles].map((fileName) =>
                              <DisplayAttachmentButton key={fileName} fileName={fileName} removeFileHandler={handleRemoveFile}/>
                          )
                      }
                      </div>
                      <div style={{textAlign: "right"}}>
                        <CustomUpload customComponent={AddAttachmentButton}
                        conversationId={conversationId}
                        uploadedFilesRef={uploadedFilesRef}
                        setUploadedFiles={setUploadedFiles}/>
                        <button type='submit'
                          className='button button--reply form-group__element--right button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'>
                          Send
                        </button>
                      </div>
                    </form>
                  }
                </div>
                {
                  notes.map((note, key) => {
                    return (<Note dispatch={dispatch} conversationId={conversationId} note={note} privileges={privileges} key={key} />);
                  })
                }
              </div>
            </section>
          </section>
        }
      </div>
    </div>
  );
};

Conversation.propTypes = {
  dispatch: PropTypes.func,
  conversations: PropTypes.object,
  privileges: PropTypes.object,
  match: PropTypes.object
};

export default withRouter(connect(state => ({
  conversation: state.conversations.conversation,
  privileges: state.api.tokens.privileges
}))(Conversation));
