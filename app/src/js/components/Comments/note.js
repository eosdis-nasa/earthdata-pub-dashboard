import React from 'react';
import PropTypes from 'prop-types';
import { CueFileUtility, LocalUpload } from '@edpub/upload-utility';
import { lastUpdated } from '../../utils/format';
import { loadToken } from '../../utils/auth';
import _config from '../../config';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const Note = ({ note, user }) => {
    const { apiRoot, useCUEUpload } = _config;
    const download = (useCUEUpload?.toLowerCase?.() === 'false' ? new LocalUpload() : new CueFileUtility());
    const show_visibility = note.viewer_str != '' ? true : false;

    const handleDownload = ({ noteId, attachment }) => {
        if (!noteId || noteId.startsWith('temp')) return;

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
        <div className='flex__row--border' style={{paddingTop: '.75em', paddingBottom: '.75em'}}>
            <div className='flex__item--w-15'>
                <h3>{note.from?.name || user}</h3>
                {lastUpdated(note.sent, 'Sent')}
            </div>
            <div className='flex__item--grow-1-wrap' style={{padding: '0em 1em'}}>
                <div style={{fontSize: '.85em', fontStyle: 'italic'}}>
                    { show_visibility ? 'Restricted' : 'Open'} Visibility {show_visibility ? `: ${note.viewer_str}` : ''}
                </div>
                <br/>
                <div 
                    style={{ 
                        whiteSpace: "pre-wrap", 
                        overflowWrap: "break-word",
                    }}
                >
                    {decodeURI(note.text)}
                </div>
            </div>
            <div className='flex__item--w-15'>
                {note?.attachments?.length > 0 && (
                    <>
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