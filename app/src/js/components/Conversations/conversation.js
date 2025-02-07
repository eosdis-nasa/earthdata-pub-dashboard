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

const getConversations = (dispatch, conversationId, lvl) => {
  if (lvl) {
    document.getElementById('all_button').classList.add('active');
    document.getElementById('users_only_button').classList.remove('active');
  } else {
    document.getElementById('all_button').classList.remove('active');
    document.getElementById('users_only_button').classList.add('active');
  }
  dispatch(getConversation(conversationId, lvl));
};



const Conversation = ({ dispatch, conversation, privileges, match }) => {
  const current_user_id = JSON.parse(window.localStorage.getItem('auth-user')).id;
  const { conversationId } = match.params;
  const [showSearch, setShowSearch] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  useEffect(() => {
    dispatch(getConversation(conversationId));
  }, []);
  const { data, inflight, meta } = conversation;
  const { subject, notes = [], participants = [] } = data;
  const { queriedAt } = meta;
  const { canReply, canAddUser } = notePrivileges(privileges);
  const visibilityRef = useRef();
  const uploadedFilesRef = useRef();

  const [tempNotes, setTempNotes] = useState([]);
  const [displayNotes, setDisplayNotes] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  const [shouldStopRetries, setShouldStopRetries] = useState(false);

  const handleVisibilityReset = () => {
    visibilityRef?.current?.resetIdMap();
  };

  const MAX_RETRIES = 5; // Max retries before stopping
  const BASE_DELAY = 1000; // Start with 1 sec delay
  let currentTimeout = null; // Store timeout ID

  useEffect(() => {
    if (notes.length === 0) return;
    if (shouldStopRetries) return;

    const firstNewNote = notes[0]; 
    const firstTempNote = tempNotes.length > 0 ? tempNotes[0] : null;

    console.log("Checking latest backend note:", firstNewNote);
    console.log("Comparing with first temp note:", firstTempNote);

    if (!firstTempNote) {
      console.log("No temp note found, updating displayNotes directly.");
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
      console.log("Exact match found. Replacing temp note with backend note.");
      setShouldStopRetries(true);
      setTempNotes(prevTempNotes => prevTempNotes.slice(1)); 
      setDisplayNotes([firstNewNote, ...notes.slice(1)]);
      return;
    }

    if (isTextMatch && !areAttachmentsMatch) {
      console.log("Text matches, but attachments don’t. Continuing retries...");
      checkForUpdates();
    }
  }, [notes]);
  


  
  const checkForUpdates = async (retryCount = 0) => {
    if (retryCount >= MAX_RETRIES || shouldStopRetries) {
      console.log("Max retries reached or stop flag set. Stopping update checks.");
      clearTimeout(currentTimeout);  // Clear the timeout if retries should stop
      return;
    }
  
    let delay = BASE_DELAY * Math.pow(2, retryCount);
    console.log(`Checking for new note, Attempt: ${retryCount + 1}, Delay: ${delay}ms`);
  
    // Clear previous timeout before setting a new one
    if (currentTimeout) {
      clearTimeout(currentTimeout);
    }
  
    currentTimeout = setTimeout(async () => {
      if (shouldStopRetries) {
        console.log("Stop flag is set. Cancelling scheduled retry.");
        clearTimeout(currentTimeout);
        return;
      }
  
      // Fetch latest notes from backend
      await dispatch(getConversation(conversationId));
      
      // Ensure we get the most recent notes state
      const latestNotes = notes || [];
      const firstNewNote = latestNotes.length > 0 ? latestNotes[0] : null;
      const firstTempNote = tempNotes.length > 0 ? tempNotes[0] : null;
  
      console.log("Checking latest backend note:", firstNewNote);
      console.log("Comparing with first temp note:", firstTempNote);
  
      if (!firstTempNote) {
        console.log("No temp note found. Stopping further checks.");
        setShouldStopRetries(true);
        clearTimeout(currentTimeout);
        return;
      }
  
      // Step 1: Check if text matches
      const isTextMatch = firstTempNote.text === firstNewNote.text;
  
      // Step 2: Check if attachments match
      const areAttachmentsMatch =
        new Set(firstTempNote.attachments).size === new Set(firstNewNote.attachments || []).size &&
        firstTempNote.attachments.every(att =>
          (firstNewNote.attachments || []).some(newAtt => newAtt.trim() === att.trim())
        );
  
      if (isTextMatch && areAttachmentsMatch) {
        console.log("Backend note fully matches temp note! Stopping retries.");
        setShouldStopRetries(true);
        setTempNotes([]); // Clear temp notes
        setDisplayNotes([firstNewNote, ...latestNotes.slice(1)]);
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
    console.log('uploadedFiles', uploadedFiles, ...uploadedFiles);

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
      console.log("Adding tempNote:", tempNote);
      setTempNotes(prev => [tempNote, ...prev]);
      setDisplayNotes(prev => [tempNote, ...prev]);
    }else{
      setTempNotes(prev => [...prev]);
      setDisplayNotes(prev => [...prev]);
    }

    

    const payload = { 
      conversation_id: id, 
      text: resp,
      viewer_users,
      viewer_roles,
      attachments: [...uploadedFiles]
    };

    await dispatch(replyConversation(payload));

    setShouldStopRetries(false);
    checkForUpdates(0);

    if (textRef.current) {
      textRef.current.value = '';
    }
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
  match: PropTypes.object
};

export default withRouter(connect(state => ({
  conversation: state.conversations.conversation,
  privileges: state.api.tokens.privileges
}))(Conversation));
