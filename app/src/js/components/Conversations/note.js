'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { lastUpdated } from '../../utils/format';
import { RenderedNoteVisibility } from './visibility';

const Note = ({ dispatch, note, conversationId, privileges }) => {

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
                        <div><a>{attachment}</a></div>
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