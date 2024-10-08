'use strict';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import {
  getConversation,
  replyConversation,
  addUsersToConversation,
  addUserToNote,
  removeUserFromNote,
  addRoleToNote,
  removeRoleFromNote,
  getUser,
  getRole
} from '../../actions';
import { notePrivileges } from '../../utils/privileges';
import { lastUpdated } from '../../utils/format';
import SearchModal from '../SearchModal';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import LoadingOverlay from '../LoadingIndicator/loading-overlay';

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

const handleRemove = (dispatch, conversationId, noteId, viewerId, viewerType) => {
  let payload;
  switch(viewerType){
    case "user":
      payload = {
        "note_id": noteId,
        "viewer_id": viewerId, 
      }
      dispatch(removeUserFromNote(payload, conversationId));
      break;
    case "role":
      payload = {
        "note_id": noteId,
        "viewer_role": viewerId, 
      }
      dispatch(removeRoleFromNote(payload, conversationId));
      break;
  }
}

const Conversation = ({ dispatch, conversation, privileges, match }) => {
  const current_user_id = JSON.parse(window.localStorage.getItem('auth-user')).id;
  const { conversationId } = match.params;
  const [showSearch, setShowSearch] = useState(false);
  const [showViewerSearch, setShowViewerSearch] = useState(false);
  const [searchType, setSearchType] = useState('user');
  const [newCommentViewers, setNewCommentViewers] = useState([]);
  const [newCommentViewerRoles, setNewCommentViewerRoles] = useState([]); 
  const [idMap, setIdMap] = useState({});
  useEffect(() => {
    dispatch(getConversation(conversationId));
  }, []);
  const { data, inflight, meta } = conversation;
  const { subject, notes, participants } = data;
  const { queriedAt } = meta;
  const { canReply, canAddUser, canAddGroup, canRemoveUser } = notePrivileges(privileges);

  const reply = (dispatch, id) => {
    // ensure the person adding the comment is a viewer if they've limited the note
    const user_viewers = [...newCommentViewers];
    if (!user_viewers.includes(current_user_id) && 
        (newCommentViewers.length || newCommentViewerRoles.length)){
          user_viewers.push(current_user_id);         
      } 
    const resp = encodeURI(textRef.current.value);
    const payload = { 
      conversation_id: id, 
      text: resp,
      viewer_users: user_viewers, 
      viewer_roles: newCommentViewerRoles
    };
      dispatch(replyConversation(payload));
    textRef.current.value = '';
    setNewCommentViewers([]);
    setNewCommentViewerRoles([]);
    setIdMap([]);

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
  const cancelViewerCallback = () => setShowViewerSearch(false);

  const openViewerSearch = (searchEntity) => {
    setSearchType(searchEntity);
    setShowViewerSearch(true);
  }

  const submitViewerCallback = (id) => {
    if (!newCommentViewers.includes(id)){
      dispatch(getUser(id)).then( (user) =>{
        let mapCopy = { ...idMap }; 
        mapCopy[id] = user.data.name;
        setIdMap(mapCopy);
        setNewCommentViewers([...newCommentViewers, id]);
      })
    }

    setShowViewerSearch(false);
  };

  const submitRoleCallback = (id) => {
    if (!newCommentViewerRoles.includes(id)){
      dispatch(getRole(id)).then( (role) =>{
        let mapCopy = { ...idMap }; 
        mapCopy[id] = role.data.long_name;
        setIdMap(mapCopy);
        setNewCommentViewerRoles([...newCommentViewerRoles, id]);
      })
    }
    
    setShowViewerSearch(false);
  };
  const viewerSearchOptions = {
    user: {
      entity: 'user',
      submit: submitViewerCallback,
      cancel: cancelViewerCallback
    },
    role: {
      entity: 'role',
      submit: submitRoleCallback,
      cancel: cancelViewerCallback
    }
  };

  const removeViewer = (viewerId, viewerType) => {
    switch(viewerType){
      case "user":
          const newViewers = newCommentViewers.filter((viewer) => viewer !== viewerId);
          setNewCommentViewers(newViewers);
        break;
      case "role":
        const newRoles = newCommentViewerRoles.filter((viewer) => viewer !== viewerId);
          setNewCommentViewerRoles(newRoles);
        break;
    }
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
        { showSearch && <SearchModal { ...searchOptions }/> }
        { showViewerSearch && <SearchModal {...viewerSearchOptions[searchType]} />}
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
                  <div className='flex__item--w-15'>

                  </div>
                  {canReply &&
                    <form className='flex__column flex__item--grow-1'
                      onSubmit={(e) => { e.preventDefault(); reply(dispatch, conversationId); }}>
                      <textarea placeholder='Type your reply'
                        ref={textRef}
                        aria-label="Type your reply"
                        title="Type your reply"></textarea>
                        <p>Comment Visibility:</p>
                        { newCommentViewers && newCommentViewers.map((viewer) => {
                          return (
                            <div key={viewer} className='flex__row sm-border'>
                              <div className='flex__item--w-25'>
                                {idMap[viewer]}
                              </div>
                              <div className='flex__item--w-15'>
                                {canRemoveUser &&
                                  <button
                                    className='button button--remove button__animation--md button__arrow button__arrow--md button__animation'
                                    onClick={(e) => { e.preventDefault(); removeViewer(viewer, 'user'); }}
                                    >
                                    Remove
                                  </button>
                                }
                              </div>
                            </div>
                          )}
                        )}
                        { newCommentViewerRoles && newCommentViewerRoles.map((viewer) => {
                          return (
                            <div key={viewer} className='flex__row sm-border'>
                              <div className='flex__item--w-25'>
                                {idMap[viewer]}
                              </div>
                              <div className='flex__item--w-15'>
                                {canRemoveUser &&
                                  <button
                                    className='button button--remove button__animation--md button__arrow button__arrow--md button__animation'
                                    onClick={(e) => { e.preventDefault(); removeViewer(viewer, 'role') }}
                                    >
                                    Remove
                                  </button>
                                }
                              </div>
                            </div>
                          )}
                        )}
                      { canAddUser &&
                        <div className='flex__row'>
                          <div className='flex__item--spacing'>
                            <button type='button'
                              className='button button--add button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'
                              onClick={() => openViewerSearch('user')}
                            >
                              Add Viewer
                            </button>
                          </div>
                          <div className='flex__item--spacing'>
                            <button type='button'
                              className='button button--add button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'
                              onClick={() => openViewerSearch('role')}
                              >
                              Add Viewer Role
                            </button>
                          </div>
                        </div>
                      }
                      <div>
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

const Note = ({ dispatch, note, conversationId, privileges }) => {
  const noteId  = note.id;
  const [showSearch, setShowSearch] = useState(false);
  const [searchType, setSearchType] = useState('user');
  const { canAddUser, canRemoveUser } = notePrivileges(privileges);
  const cancelCallback = () => setShowSearch(false);
  const viewerSubmitCallback = (id) => {
    const params = {
      note_id: noteId,
      viewer_ids: [id]
    };
    dispatch(addUserToNote(params, conversationId));
    setShowSearch(false);
  };
  const roleSubmitCallback = (id) => {
    const params = {
      note_id: noteId,
      viewer_roles: [id]
    };
    dispatch(addRoleToNote(params, conversationId));
    setShowSearch(false);
  };
  const searchOptions = {
    user: {
      entity: 'user',
      submit: viewerSubmitCallback,
      cancel: cancelCallback
    },
    role: {
      entity: 'role',
      submit: roleSubmitCallback,
      cancel: cancelCallback
    }
  };
  return (
    <div className='flex__row--border'>
      <div className='flex__item--w-15'>
        <h3>{ note.from.name }</h3>
        {lastUpdated(note.sent, 'Sent')}
        <br/>
        {note.viewers.users || note.viewers.roles ? <h3>Note Visibility</h3> : null}
        <div className='flex__column'>
          {
            note.viewers.users &&
            note.viewers.users.map((user) => {
              return (
                <div key={user.id} className='flex__row sm-border'>
                  <div className='flex__item--w-15' style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '190px' }}>
                      <style>
                        {`                   
                          .flex__item--w-15 .button--remove {
                            color: white;
                          }
                          
                          .flex__item--w-15 .button--remove:hover::before {
                            color: white;
                            background-color: #2c3e50;
                            visibility: visible;
                          }

                          .flex__item--w-15 .button--remove:hover {
                            background-color: #2c3e50;
                          }
                        `}
                      </style>
                      <span style={{ width: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={user.name}>
                        {user.name} 
                      </span>
                      {canRemoveUser && (
                        <button
                          className='button button--remove'
                          onClick={(e) => { e.preventDefault(); handleRemove(dispatch, conversationId, note.id, user.id, 'user'); }}
                          style={{ marginLeft: '2px', padding: '0px 10px 20px 25px'}}
                        >
                        </button>
                      )}
                    </div>
                </div>
              )
            })
          }   
          {
            note.viewers.roles &&
            note.viewers.roles.map((role) => {
              return (
                <div key={role.id} className='flex__row sm-border'>
                <div className='flex__item--w-15' style={{ display: 'flex', justifyContent: 'space-between', width: '190px' }}>
                  <span style={{ width: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={role.name} >
                    {role.name} 
                  </span>
                  {canRemoveUser && (
                    <button
                      className='button button--remove'
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemove(dispatch, conversationId, note.id, role.id, 'role');
                      }}
                      style={{ marginLeft: '2px', padding: '0px 10px 20px 25px'}}
                    >          
                    </button>
                  )}
                </div>
              </div>             
              )
            })
          }              
        </div>
        <div className='flex__item--w-15'>
          {canAddUser &&
            <button
              className='button button--add button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'
              onClick={() => {setShowSearch(true); setSearchType('user')}}
            >
              Add Viewer&nbsp;&nbsp;
            </button>
          }
          <br /><br />
          {canAddUser &&
            <button
              className='button button--add button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'
              onClick={() => {setShowSearch(true); setSearchType('role')}}
            >
              Add Viewer Role&nbsp;&nbsp;
            </button>
          }
        </div>
      </div>
      { showSearch && <SearchModal { ...searchOptions[searchType] }/> }
      <div className='flex__item--grow-1-wrap'style={{whiteSpace: "pre-wrap", overflowWrap: "break-word"}}>{ decodeURI(note.text) }</div>
    </div>
  );
};

Note.propTypes = {
  dispatch: PropTypes.func,
  note: PropTypes.object,
  conversationId: PropTypes.string,
  privileges: PropTypes.object
};

export default withRouter(connect(state => ({
  conversation: state.conversations.conversation,
  privileges: state.api.tokens.privileges
}))(Conversation));
