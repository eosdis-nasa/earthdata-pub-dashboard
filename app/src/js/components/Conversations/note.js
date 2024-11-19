'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import localUpload from '@edpub/upload-utility';
import { lastUpdated } from '../../utils/format';
import { RenderedNoteVisibility } from './visibility';
import { loadToken } from '../../utils/auth';
import _config from '../../config';

const Note = ({ dispatch, note, conversationId, privileges }) => {

    const download = new localUpload();

    const handleDownload = ({noteId, attachment}) => {
        const { apiRoot } = _config;
        download.downloadFile(`attachments/${noteId}/${attachment}`, `${apiRoot}data/upload/downloadUrl`, loadToken().token).then((resp) => {
            let error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error
            if (error) {
              console.log(`An error has occurred: ${error}.`);
            }
          })
    };

    return (
        <div className='flex__row--border'>
            <div className='flex__item--w-15'>
                <h3>{note.from.name}</h3>
                {lastUpdated(note.sent, 'Sent')}
                <br />
                <RenderedNoteVisibility note={note} dispatch={dispatch} conversationId={conversationId} privileges={privileges} />
            </div>
            <div className='flex__item--grow-1-wrap'>
                <div style={{ whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>{decodeURI(note.text)}</div>
                {note.attachments ? <>
                    <br/>
                    <label>Attachments:</label>
                    <div>
                    {note.attachments.map((attachment) =>
                        <div><a onClick={(e) => handleDownload({noteId: note.id, attachment})}>{attachment}</a></div>
                    )}
                    </div>
                </> : null }
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