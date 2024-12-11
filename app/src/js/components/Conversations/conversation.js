'use strict';
import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  getConversation,
  replyConversation,
  addUsersToConversation,
  getNoteById,
  getNoteAll
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

  const reply = async(dispatch, id) => {
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
    await dispatch(replyConversation(payload));

    const convDetails =  await dispatch(getConversation(conversationId));
    console.log('convDetails', convDetails)
    
    // if(convDetails.data.notes && convDetails.data.notes[0] && convDetails.data.notes[0].id){
    //   const getAttachmentCount = await dispatch(getNoteById(convDetails.data.notes[0].id));
    //   console.log('getAttachmentCount', getAttachmentCount);
    //   if(getAttachmentCount.attachments.length !== convDetails.data.notes[0].attachments.length){
    //     await dispatch(getConversation(conversationId));
    //   }
    // }
    const noteAll = await dispatch(getNoteAll());
    console.log('noteALL', noteAll)
    let filteredData = [];
    if(noteAll && noteAll.data){
      filteredData = noteAll.data.filter(item => item.conversation_id === conversationId);
      console.log('filteredData', filteredData)
    }

    // Find mismatches where attachment lengths do not match
    const mismatchedEntries = filteredData.filter(dataItem => {
        const matchingNote = convDetails.data.notes.find(noteItem => noteItem.id === dataItem.id);

        // Ensure matchingNote exists and compare attachment lengths
        if (matchingNote) {
            const dataAttachmentsLength = dataItem.attachments ? dataItem.attachments.length : 0;
            const noteAttachmentsLength = matchingNote.attachments ? matchingNote.attachments.length : 0;
            return dataAttachmentsLength !== noteAttachmentsLength;
        }

        // If no matching note is found, return false
        return false;
    });

    // Output mismatched entries
    console.log("Mismatched Entries:", mismatchedEntries);

    async function checkAttachments() {
      const intervalId = setInterval(async () => {
        if (convDetails.data.notes && convDetails.data.notes[0] && convDetails.data.notes[0].id) {
          const getAttachmentCount = await dispatch(getNoteById(convDetails.data.notes[0].id));
          console.log('getAttachmentCount', getAttachmentCount);
          
          if (getAttachmentCount.data.attachments.length !== convDetails.data.notes[0].attachments.length) {
            await dispatch(getConversation(conversationId));
          } else {
            clearInterval(intervalId); 
            console.log('Condition met, stopped polling.');
          }
        } else {
          clearInterval(intervalId); 
          //console.error('No Note data.');
        }
      }, 3000000); 
    }
    
    checkAttachments();
    
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
                {
                  notes.map((note, key) => {
                    return (<Note dispatch={dispatch} conversationId={conversationId} note={note} privileges={privileges} key={key} />);
                  })
                }
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
