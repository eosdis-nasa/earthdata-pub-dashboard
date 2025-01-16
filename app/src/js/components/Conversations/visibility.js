'use strict';
import React, { useState, useImperativeHandle } from 'react';
import SearchModal from '../SearchModal';
import { notePrivileges } from '../../utils/privileges';
import {
    getUser,
    getRole
} from '../../actions';

export const NewNoteVisibility = ({ dispatch, privileges, visibilityRef }) => {
    const [searchType, setSearchType] = useState('user');
    const [showSearch, setShowSearch] = useState(false);
    const [newCommentViewers, setNewCommentViewers] = useState([]);
    const [newCommentViewerRoles, setNewCommentViewerRoles] = useState([]);
    const [idMap, setIdMap] = useState({});
    useImperativeHandle(visibilityRef, () => ({
        getVisibility: () => ({viewer_users: newCommentViewers, viewer_roles: newCommentViewerRoles}),
        resetIdMap: () => {
            setIdMap([]);
            setNewCommentViewers([]);
            setNewCommentViewerRoles([]);
        }
      }));

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
            {showSearch && <SearchModal {...searchOptions[searchType]} />}
        </div>
    )
}
