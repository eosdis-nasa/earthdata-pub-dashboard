'use strict';
import React, { useEffect, useState, useImperativeHandle } from 'react';
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

export const RenderedNoteVisibility = ({ dispatch, note, conversationId, privileges, selectedFilter }) => {
    const noteId = note.id;

    const [searchType, setSearchType] = useState('user');
    const [showSearch, setShowSearch] = useState(false);
    const { canAddUser, canRemoveUser } = notePrivileges(privileges);

    const cancelCallback = () => setShowSearch(false);
    const submitCallback = (id) => {
        const params = {
            note_id: noteId,
            viewer_ids: [id]
        };
        dispatch(addUserToNote(params, conversationId, selectedFilter));
        setShowSearch(false);
    };

    const roleSubmitCallback = (id) => {
        const params = {
            note_id: noteId,
            viewer_roles: [id]
        };
        dispatch(addRoleToNote(params, conversationId, selectedFilter));
        setShowSearch(false);
    };

    const searchOptions = {
        user: {
            entity: 'user',
            submit: submitCallback,
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
                dispatch(removeUserFromNote(payload, conversationId, selectedFilter));
                break;
            case "role":
                payload = {
                    "note_id": noteId,
                    "viewer_role": viewerId,
                }
                dispatch(removeRoleFromNote(payload, conversationId, selectedFilter));
                break;
        }
    }

    return (
        <div>
            <h3>Visibility</h3>
            <div className='flex__column'>
    {/* Users Section */}
    <div style={{ fontWeight: 'bold', fontSize: '14px', marginTop: '8px', marginBottom: '4px', borderBottom: '1px solid #ccc' }}>
        Viewers
    </div>
    {note.viewers.users && note.viewers.users.length > 0 ? (
        note.viewers.users.map((user) => (
            <div key={user.id} className='flex__row sm-border'>
                <div className='flex__item--w-15' style={{ display: 'flex', justifyContent: 'space-between', width: '190px' }}>
                    <span style={{ width: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={user.name}>
                        {user.name}
                    </span>
                    {canRemoveUser && (
                        <button
                            className='button button--remove'
                            onClick={(e) => {
                                e.preventDefault();
                                handleRemove(dispatch, conversationId, note.id, user.id, 'user');
                            }}
                            style={{ marginTop: '0px', marginLeft: '2px', padding: '0px 10px 20px 25px' }}
                        >
                        </button>
                    )}
                </div>
            </div>
        ))
    ) : (
        <div style={{ fontStyle: 'italic', color: '#777' }}>No viewers added</div>
    )}
    {canAddUser && (
        <div style={{ marginTop: '6px' }}>
            <button
                className='button button--add button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'
                onClick={() => { setShowSearch(true); setSearchType('user') }}
            >
                Add Viewer&nbsp;&nbsp;
            </button>
        </div>
    )}

    {/* Roles Section */}
    <div style={{ fontWeight: 'bold', fontSize: '14px', marginTop: '12px', marginBottom: '4px', borderBottom: '1px solid #ccc' }}>
        Viewer Roles
    </div>
    {note.viewers.roles && note.viewers.roles.length > 0 ? (
        note.viewers.roles.map((role) => (
            <div key={role.id} className='flex__row sm-border'>
                <div className='flex__item--w-15' style={{ display: 'flex', justifyContent: 'space-between', width: '190px' }}>
                    <span style={{ width: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={role.name}>
                        {role.name}
                    </span>
                    {canRemoveUser && (
                        <button
                            className='button button--remove'
                            onClick={(e) => {
                                e.preventDefault();
                                handleRemove(dispatch, conversationId, note.id, role.id, 'role');
                            }}
                            style={{ marginTop: '0px', marginLeft: '2px', padding: '0px 10px 20px 25px' }}
                        >
                        </button>
                    )}
                </div>
            </div>
        ))
    ) : (
        <div style={{ fontStyle: 'italic', color: '#777' }}>No viewer roles added</div>
    )}
    {canAddUser && (
        <div style={{ marginTop: '6px' }}>
            <button
                className='button button--add button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'
                onClick={() => { setShowSearch(true); setSearchType('role') }}
            >
                Add Viewer Role&nbsp;&nbsp;
            </button>
        </div>
    )}
</div>

            {showSearch && <SearchModal {...searchOptions[searchType]} />}
        </div>
    )
}

export const NewNoteVisibility = ({ dispatch, privileges, conversationId, visibilityRef }) => {
    const [searchType, setSearchType] = useState('user');
    const [showSearch, setShowSearch] = useState(false);
    const [newCommentViewers, setNewCommentViewers] = useState([]);
    const [newCommentViewerRoles, setNewCommentViewerRoles] = useState([]);
    const [idMap, setIdMap] = useState({});
    useImperativeHandle(visibilityRef, () => ({
        getVisibility: () => ({
            viewer_users: newCommentViewers,
            viewer_roles: newCommentViewerRoles,
            viewer_names: Object.values(idMap)
        }),
        resetIdMap: () => {
            setIdMap([]);
            setNewCommentViewers([]);
            setNewCommentViewerRoles([]);
        }
      }));
    useEffect(() => {
        dispatch(getConversation(conversationId));
    }, []);
    const { canAddUser, canRemoveUser } = notePrivileges(privileges);

    const openViewerSearch = (searchEntity) => {
        setSearchType(searchEntity);
        setShowSearch(true);
    }

    const cancelCallback = () => setShowSearch(false);

    const submitCallback = (id) => {
        if (!newCommentViewers.includes(id)) {
            dispatch(getUser(id)).then((user) => {
                let mapCopy = { ...idMap };
                mapCopy[id] = user.data.name;
                setIdMap(mapCopy);
                setNewCommentViewers([...newCommentViewers, id]);
            })
        }

        setShowSearch(false);
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

        setShowSearch(false);
    };

    const searchOptions = {
        user: {
            entity: 'user',
            submit: submitCallback,
            cancel: cancelCallback
        },
        role: {
            entity: 'role',
            submit: submitRoleCallback,
            cancel: cancelCallback
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
            {canAddUser && <p>Visibility:</p>}
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
            {showSearch && <SearchModal {...searchOptions[searchType]} />}
        </div>
    )
}
