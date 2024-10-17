'use strict';
import React, { useEffect, useState } from 'react';
import SearchModal from '../SearchModal';
import { notePrivileges } from '../../utils/privileges';
import {
    addUserToNote,
    addRoleToNote,
    removeUserFromNote,
    removeRoleFromNote,
    getConversation,
    getUser,
    getRole
} from '../../actions';

export const RenderedNoteVisibility = ({ dispatch, note, conversationId, privileges }) => {
    const noteId = note.id;

    const [searchType, setSearchType] = useState('user');
    const { canAddUser, canRemoveUser } = notePrivileges(privileges);
    const [showSearch, setShowSearch] = useState(false);

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

    const handleRemove = (dispatch, conversationId, noteId, viewerId, viewerType) => {
        let payload;
        switch (viewerType) {
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

    return (
        <div>
            {note.viewers.users || note.viewers.roles ? <h3>Visibility</h3> : null}
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
                                            style={{ marginLeft: '2px', padding: '0px 10px 20px 25px' }}
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
                                            style={{ marginLeft: '2px', padding: '0px 10px 20px 25px' }}
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
                        onClick={() => { setShowSearch(true); setSearchType('user') }}
                    >
                        Add Viewer&nbsp;&nbsp;
                    </button>
                }
                <br /><br />
                {canAddUser &&
                    <button
                        className='button button--add button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'
                        onClick={() => { setShowSearch(true); setSearchType('role') }}
                    >
                        Add Viewer Role&nbsp;&nbsp;
                    </button>
                }
            </div>
            {showSearch && <SearchModal {...searchOptions[searchType]} />}
        </div>
    )
}

export const NewNoteVisibility = ({ dispatch, privileges, conversationId }) => {
    const [showViewerSearch, setShowViewerSearch] = useState(false);
    const [searchType, setSearchType] = useState('user');
    const [newCommentViewers, setNewCommentViewers] = useState([]);
    const [newCommentViewerRoles, setNewCommentViewerRoles] = useState([]);
    const [idMap, setIdMap] = useState({});
    useEffect(() => {
        dispatch(getConversation(conversationId));
    }, []);
    const { canAddUser, canRemoveUser } = notePrivileges(privileges);

    const openViewerSearch = (searchEntity) => {
        setSearchType(searchEntity);
        setShowViewerSearch(true);
    }

    const cancelViewerCallback = () => setShowViewerSearch(false);

    const submitViewerCallback = (id) => {
        if (!newCommentViewers.includes(id)) {
            dispatch(getUser(id)).then((user) => {
                let mapCopy = { ...idMap };
                mapCopy[id] = user.data.name;
                setIdMap(mapCopy);
                setNewCommentViewers([...newCommentViewers, id]);
            })
        }

        setShowViewerSearch(false);
    };

    const submitRoleCallback = (id) => {
        if (!newCommentViewerRoles.includes(id)) {
            dispatch(getRole(id)).then((role) => {
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
        switch (viewerType) {
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
    return (
        <div>
            <p>Visibility:</p>
            {
                newCommentViewers && newCommentViewers.map((viewer) => {
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
                    )
                }
                )
            }
            {
                newCommentViewerRoles && newCommentViewerRoles.map((viewer) => {
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
                    )
                }
                )
            }
            {
                canAddUser &&
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
            {showViewerSearch && <SearchModal {...viewerSearchOptions[searchType]} />}
        </div>
    )
}
