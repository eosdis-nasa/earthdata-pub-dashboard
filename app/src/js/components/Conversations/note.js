import React from 'react';
import PropTypes from 'prop-types';
import localUpload from '@edpub/upload-utility';
import { lastUpdated } from '../../utils/format';
import { RenderedNoteVisibility } from './visibility';
import { loadToken } from '../../utils/auth';
import _config from '../../config';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const Note = ({ dispatch, note, conversationId, privileges, user, selectedFilter }) => {
    const download = new localUpload();

    const handleDownload = ({ noteId, attachment }) => {
        if (!noteId || noteId.startsWith('temp')) return;

        const { apiRoot } = _config;
        download.downloadFile(
            `attachments/${noteId}/${attachment}`, 
            `${apiRoot}data/upload/downloadUrl`, 
            loadToken().token
        ).then((resp) => {
            let error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error;
            if (error) {
                console.log(`An error has occurred: ${error}.`);
            }
        });
    };

    return (
        <div className='flex__row--border'>
            <div className='flex__item--w-15'>
                <h3>{note.from?.name || user}</h3>
                {lastUpdated(note.sent, 'Sent')}
                <br />
                <RenderedNoteVisibility note={note} selectedFilter = {selectedFilter || false} dispatch={dispatch} conversationId={conversationId} privileges={privileges} />
            </div>
            <div className='flex__item--grow-1-wrap'>
                <div 
                    style={{ 
                        whiteSpace: "pre-wrap", 
                        overflowWrap: "break-word"
                    }}
                >
                    {decodeURI(note.text)}
                </div>

                {note?.attachments?.length > 0 && (
                    <>
                        <br/>
                        <label>Attachments:</label>
                        <div>
                            {note.attachments.map((attachment, idx) => (
                                <React.Fragment key={idx}>
                                    {idx > 0 ? ', ' : ' '}
                                    {note.id && !note.id.startsWith('temp') ? (
                                        <a onClick={() => handleDownload({ noteId: note.id, attachment })}>
                                            {attachment}
                                        </a>
                                    ) : (
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip id={`tooltip-${note.id}-${idx}`}>Attachment temporarily unavailable.</Tooltip>}
                                        >
                                            <span style={{ cursor: "not-allowed", color: "grey" }}>{attachment}</span>
                                        </OverlayTrigger>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </>
                )}
            </div>
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
