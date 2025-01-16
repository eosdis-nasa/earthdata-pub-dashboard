'use strict';
import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import localUpload from '@edpub/upload-utility';
import { lastUpdated } from '../../utils/format';
import { loadToken } from '../../utils/auth';
import _config from '../../config';
import SearchModal from '../SearchModal';
import { notePrivileges } from '../../utils/privileges';
import {
    addUserToNote,
    addRoleToNote,
    removeUserFromNote,
    removeRoleFromNote,
} from '../../actions';

const RenderedNote = ({note, dispatch, privileges, conversationId}) => {
    const download = new localUpload();
    const [showSearch, setShowSearch] = useState(false);
    const [searchType, setSearchType] = useState('user');
    const [showViewersModal, setShowViewersModal] = useState(false);
    const { canAddUser, canRemoveUser } = notePrivileges(privileges);

    const handleDownload = ({noteId, attachment}) => {
        const { apiRoot } = _config;
        download.downloadFile(`attachments/${noteId}/${attachment}`, `${apiRoot}data/upload/downloadUrl`, loadToken().token).then((resp) => {
            let error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error
            if (error) {
              console.log(`An error has occurred: ${error}.`);
            }
          })
    };

    const cancelCallback = () => setShowSearch(false);
    const submitCallback = (id) => {
        const params = {
            note_id: note.id,
            viewer_ids: [id]
        };
        dispatch(addUserToNote(params, conversationId));
        setShowSearch(false);
    };

    const roleSubmitCallback = (id) => {
        const params = {
            note_id: note.id,
            viewer_roles: [id]
        };
        dispatch(addRoleToNote(params, conversationId));
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
    };

    return (
        <>
            {showSearch && <SearchModal {...searchOptions[searchType]} />}
            <div className='flex__item--grow-1-wrap'>
                <h3>{note.from.name}</h3>
                <div>
                    <div>
                        <div style={{ whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>{decodeURI(note.text)}</div>
                        {note?.attachments?.length > 0 ? <>
                            <br/>
                            <label>Attachments:</label>
                            <div>
                            {note.attachments.map((attachment, idx) =>
                                <div key={idx}><a onClick={(e) => handleDownload({noteId: note.id, attachment})}>{attachment}</a></div>
                            )}
                            </div>
                        </> : null }
                        <br />
                    </div>
                </div>
                {lastUpdated(note.sent, 'Sent')}
                <div style={{display: "flex", marginTop: "5px"}}>
                    {canAddUser &&
                        <>
                        <label onClick={() => { setShowSearch(true); setSearchType('user') }} className='note-options'>Add Viewer</label>
                        <label>&nbsp;|&nbsp;</label>
                        <label onClick={() => { setShowSearch(true); setSearchType('role') }} className='note-options'>Add Viewer Role</label>
                        <label>&nbsp;|&nbsp;</label>
                        </>
                    }
                    <label onClick={() => setShowViewersModal(true)} className='note-options'>Manage Viewers</label>
                    <label>&nbsp;|&nbsp;</label>
                    <label className='note-options'>...</label>
                </div>
            </div>
            <Modal show={showViewersModal} onHide={() => setShowViewersModal(false)} className="custom-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Viewers</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {note.viewers.users || note.viewers.roles ?
                        <div>
                            {note.viewers.users &&
                             note.viewers.users.map((user, idx) => {
                                return (
                                    <div style={{display: "flex", paddingTop: "5px"}} key={idx}>
                                        <label>{user.name}</label>
                                        {canRemoveUser && (
                                            <button
                                                className='button button--remove'
                                                onClick={(e) => { e.preventDefault(); handleRemove(dispatch, conversationId, note.id, user.id, 'user'); }}
                                                style={{ marginLeft: '15px', padding: '0px 10px 20px 25px' }}
                                            >
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                            {note.viewers.roles &&
                             note.viewers.roles.map((role, idx) => {
                                return (
                                    <div style={{display: "flex", paddingTop: "5px"}} key={idx}>
                                        <label>{role.name}</label>
                                        {canRemoveUser && (
                                            <button
                                                className='button button--remove'
                                                onClick={(e) => { e.preventDefault(); handleRemove(dispatch, conversationId, note.id, role.id, 'role'); }}
                                                style={{ marginLeft: '2px', padding: '0px 10px 20px 25px' }}
                                            >
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        // TODO - Figure out best way of portraying no viewers currently defined
                        : <div>Default viewers (all)</div>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewersModal(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

const SystemMessage = ({note}) => {
    return (
        <div style={{display: "inline", marginLeft: "25%", textAlign: "center", width: "50%"}}>
            <div style={{ whiteSpace: "pre-wrap", overflowWrap: "break-word", fontWeight: "bold"}}>{decodeURI(note.text)}</div>
            {lastUpdated(note.sent, '')}
        </div>
    );
};

const Note = ({ dispatch, note, conversationId, privileges, currentUserId }) => {

    return (
        <div className='flex__row--border' style={{borderTop: "1px solid #E2DFDF"}}>
            {note.from.id === '1b10a09d-d342-4eee-a9eb-c99acd2dde17' ? <SystemMessage note={note} />
            : <RenderedNote note={note} dispatch={dispatch} privileges={privileges} conversationId={conversationId}/>}
        </div>
    );
};

Note.propTypes = {
    dispatch: PropTypes.func,
    note: PropTypes.object,
    conversationId: PropTypes.string,
    privileges: PropTypes.object
};

export default Note;