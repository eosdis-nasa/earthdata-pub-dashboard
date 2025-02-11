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


const textRef = React.createRef();


const Conversation = ({ dispatch, conversation, privileges, match, user }) => {
  const current_user_id = JSON.parse(window.localStorage.getItem('auth-user')).id;
  const { conversationId } = match.params;
  const [showSearch, setShowSearch] = useState(false);
  const [level, setLevel] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  // useEffect(() => {
  //   dispatch(getConversation(conversationId));
  // }, []);
  const getConversations = async(dispatch, conversationId, lvl) => {
    if (lvl) {
      setLevel(lvl);
      document.getElementById('all_button').classList.add('active');
      document.getElementById('users_only_button').classList.remove('active');
    } else {
      setLevel(false);
      document.getElementById('all_button').classList.remove('active');
      document.getElementById('users_only_button').classList.add('active');
    }

    const newData = await dispatch(getConversation(conversationId, lvl));
    if(newData?.data?.notes) setDisplayNotes(newData?.data?.notes);
  };
  const { data, inflight, meta } = conversation;
  const { subject, notes = [], participants = [] } = data;
  const { queriedAt } = meta;
  const { canReply, canAddUser } = notePrivileges(privileges);
  const visibilityRef = useRef();
  const uploadedFilesRef = useRef();

  const [tempNotes, setTempNotes] = useState([]);
  const [displayNotes, setDisplayNotes] = useState(data.notes);
  const [retryCount, setRetryCount] = useState(0);
  const [shouldStopRetries, setShouldStopRetries] = useState(false);

  const handleVisibilityReset = () => {
    visibilityRef?.current?.resetIdMap();
  };

  const MAX_RETRIES = 7;
  const RETRY_INTERVALS = [5000, 5000, 10000, 15000, 15000, 15000, 15000];
  //5,10,20,35,50,65,80
  let currentTimeout = null; // Store timeout ID

  useEffect(() => {

    const fetchNotes = async () => {
      const finalNotes = await dispatch(getConversation(conversationId, level));
      setDisplayNotes(finalNotes?.data?.notes)
    };
    
   // if (notes.length === 0) return;
    if (shouldStopRetries) return;

    const firstNewNote = notes[0]; 
    const firstTempNote = tempNotes.length > 0 ? tempNotes[0] : null;

    if (!firstTempNote) {
      setDisplayNotes(notes);
      return;
    }

    const isTextMatch = firstTempNote.text === firstNewNote.text;
    const areAttachmentsMatch =
      new Set(firstTempNote.attachments).size === new Set(firstNewNote.attachments || []).size &&
      firstTempNote.attachments.every(att =>
        (firstNewNote.attachments || []).some(newAtt => newAtt.trim() === att.trim())
      );

    if (isTextMatch && areAttachmentsMatch) {
      setShouldStopRetries(true);
      setTempNotes(prevTempNotes => prevTempNotes.slice(1)); 
      setDisplayNotes([firstNewNote, ...notes.slice(1)]);
      clearTimeout(currentTimeout);  // Clear the timeout if retries should stop
      fetchNotes();
      return;
    }

    if (isTextMatch && !areAttachmentsMatch) {
      checkForUpdates();
    }
  }, [notes, level]);
  
  
  const checkForUpdates = async (retryCount = 0) => {
    if (retryCount >= MAX_RETRIES || shouldStopRetries) {
        clearTimeout(currentTimeout);
        return;
    }

    const delay = RETRY_INTERVALS[retryCount];
    // Clear previous timeout before setting a new one
    if (currentTimeout) {
        clearTimeout(currentTimeout);
    }

    currentTimeout = setTimeout(async () => {
        if (shouldStopRetries) {
            clearTimeout(currentTimeout);
            return;
        }

        // Fetch latest notes from backend
        const notesAPi = await dispatch(getConversation(conversationId, level));

        // Ensure we get the most recent notes state
        const latestNotes = notesAPi?.data?.notes?.[0] || null;
        const firstNewNote = latestNotes ? latestNotes : null;
        const firstTempNote = tempNotes.length > 0 ? tempNotes[0] : null;

        if (!firstTempNote) {
            setShouldStopRetries(true);
            clearTimeout(currentTimeout);
            return;
        }

        // Step 1: Check if text matches
        const isTextMatch = firstTempNote.text === firstNewNote?.text;

        // Step 2: Check if attachments match
        const areAttachmentsMatch = firstNewNote?.attachments
            ? new Set(firstTempNote.attachments).size === new Set(firstNewNote.attachments).size &&
              firstTempNote.attachments.every(att =>
                  firstNewNote.attachments.some(newAtt => newAtt.trim() === att.trim())
              )
            : false;

        if (isTextMatch && areAttachmentsMatch) {
            setShouldStopRetries(true);
            setTempNotes([]); // Clear temp notes
            setDisplayNotes(notesAPi?.data?.notes);
            clearTimeout(currentTimeout);
            return;
        }

        // If no match yet, continue checking
        checkForUpdates(retryCount + 1);

    }, delay);
};
  


  
  const handleRemoveFile = (fileName) => {
    //Have to ensure a rerender with the state update
    uploadedFiles.delete(fileName);
    setUploadedFiles(new Set([...uploadedFiles]));
  };

  const reply = async (dispatch, id) => {
    const { viewer_users, viewer_roles } = visibilityRef.current.getVisibility();
    
    if (!viewer_users.includes(current_user_id) && (viewer_users.length || viewer_roles.length)) {
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

    await dispatch(replyConversation(payload));

    setShouldStopRetries(false);

    await dispatch(getConversation(id, level));

    if ([...uploadedFiles].length > 0) {
      // Create Temporary Note
      const tempNote = {
        id: `temp-${Date.now()}`,
        sent: new Date().toISOString(),
        text: resp,
        createdAt: new Date().toISOString(),
        attachments: [...uploadedFiles],
        viewers: { roles: [], users: [] },
        isTemp: true 
      };
      setTempNotes(prev => [tempNote, ...prev]);
      setDisplayNotes(prev => [tempNote, ...prev]);
      checkForUpdates(0);
    }else{
      setTempNotes(prev => [...prev]);
      setDisplayNotes(prev => [...prev]);
    }

    if (textRef.current) {
      textRef.current.value = '';
    }
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
  return (
    <div className='page__content--shortened'>
      <div className='page__component'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <section className='page__section page__section__header-wrapper'>
          <div className='page__section__header'>
            <h1 className='heading--large heading--shared-content with-description '>
              Conversation: {subject}
            </h1>
            {lastUpdated(queriedAt)}
          </div>
          <div className="filter_buttons_div">
            <label>Filter: </label>
            <button id='all_button'
                className={'form-group__element--right' + (status === 'inflight' ? ' button--disabled' : '')}
                aria-label='Get all conversation detail'
                onClick={(e) => { e.preventDefault(); getConversations(dispatch, conversationId, true); }}
              >All
            </button>
            <button id='users_only_button'
                className={'active form-group__element--right' + (status === 'inflight' ? ' button--disabled' : '')}
                aria-label='Get user conversation detail'
                onClick={(e) => { e.preventDefault(); getConversations(dispatch, conversationId, false); }}
              >User Comments Only
            </button>
          </div>
        </section>
        {showSearch && <SearchModal {...searchOptions} />}
        { inflight && <LoadingOverlay /> }
        { notes &&
          <section className='page__section flex__row'>
            <section className='page__section flex__item--grow-1'>
              <div className='heading__wrapper--border'>
                <h2 className='heading--medium heading--shared-content with-description'>
                  Notes <span className='num--title'>{notes.length}</span>
                </h2>
                <h2 className='heading--medium heading--shared-content with-description'>
                  Display <span className='num--title'>{displayNotes?.length ?? 0}</span>
                </h2>
              </div>
              <div className='flex__column--reverse'>
                <div className='flex__row--border'>
                  <div className='flex__item--w-15'/>
                  {canReply &&
                    <form className='flex__column flex__item--grow-1'
                      onSubmit={(e) => { e.preventDefault(); reply(dispatch, conversationId); }}>
                      <textarea placeholder='Type your reply'
                        ref={textRef}
                        aria-label="Type your reply"
                        title="Type your reply"></textarea>
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
                          Send Reply
                        </button>
                      </div>
                    </form>
                  }
                </div>
                {Array.isArray(displayNotes) && displayNotes.map((note) => (
                  <Note 
                    key={note.id} 
                    dispatch={dispatch} 
                    conversationId={conversationId} 
                    note={note} 
                    privileges={privileges} 
                    user = {user}
                  />
                ))}
              </div>
            </section>
            <section className='page__section flex__item--w-17 flex__item-end'>
              <div className='heading__wrapper--border'>
                <h2 className='heading--medium heading--shared-content with-description'>
                  Participants <span className='num--title'>{participants.length}</span>
                </h2>
              </div>
              <div className='flex__column'>
                {
                  participants.map((user, key) => {
                    return <div className='sm-border' key={key}>{user.name}</div>;
                  })
                }
                {canAddUser &&
                  <div className='flex__item--spacing'>
                    <button className='button button--add button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'
                      onClick={() => setShowSearch(true)}>
                      Add Users
                    </button>
                  </div>
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
  match: PropTypes.object,
  user: PropTypes.string
};

export default withRouter(connect(state => ({
  conversation: state.conversations.conversation,
  privileges: state.api.tokens.privileges,
  user: state.api.tokens.userName
}))(Conversation));