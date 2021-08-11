'use strict';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import {
  getConversation,
  replyConversation,
  addUsersToConversation } from '../../actions';
import { lastUpdated } from '../../utils/format';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import Loading from '../LoadingIndicator/loading-indicator';

const textRef = React.createRef();
const usersRef = React.createRef();

const reply = (dispatch, id) => {
  const payload = { conversation_id: id, text: textRef.current.value };
  dispatch(replyConversation(payload));
  textRef.current.value = '';
}

const addUsers = (dispatch, id) => {
  const payload = {
    conversation_id: id,
    user_list: usersRef.current.value.split(',')
  };
  dispatch(addUsersToConversation(payload));
  usersRef.current.value = '';
}

const Conversation = ({ dispatch, conversation, match }) => {
  const { conversationId } = match.params;
  useEffect(() => {
    dispatch(getConversation(conversationId));
  }, []);
  const { data, inflight, meta } = conversation;
  const { subject, notes, participants } = data;
  const { queriedAt } = meta;
  const loading = inflight || !notes;
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
      label: data.id || "",
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
        </section>
        { notes ?
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
                    { inflight && <Loading /> }
                  </div>
                  <form className='flex__column flex__item--grow-1'
                        onSubmit={(e) => { e.preventDefault(); reply(dispatch, conversationId); }}>
                    <input type='text' ref={textRef}></input>
                    <div>
                      <button type='submit'
                        className='button button--small button--green form-group__element--right'>
                        Send Reply
                      </button>
                    </div>
                  </form>
                </div>
                {
                  notes.map((note, key) => {
                    return (<Note note={note} key={key} />)
                  })
                }
              </div>
            </section>
            <section className='page__section flex__item--w-25 flex__item-end'>
              <div className='heading__wrapper--border'>
                <h2 className='heading--medium heading--shared-content with-description'>
                  Participants <span className='num--title'>{participants.length}</span>
                </h2>
              </div>
              <div className='flex__column'>
                {
                  participants.map((user, key) => {
                    return <div key={key}>{user.name}</div>
                  })
                }
                <textarea ref={usersRef} rows="1"></textarea>
                <button className='button button--small button--green form-group__element--right'
                        onClick={() => addUsers(dispatch, conversationId)}>
                Add Users
                </button>
              </div>
            </section>
          </section> :
          <Loading />
        }
      </div>
    </div>
  );
};

Conversation.propTypes = {
  dispatch: PropTypes.func,
  conversations: PropTypes.object,
  match: PropTypes.object
};

const Note = ({ note }) => {
  return (
    <div className='flex__row--border'>
      <div className='flex__item--w-15'>
        <h3>{ note.from.name }</h3>
        {lastUpdated(note.sent, 'Sent')}
      </div>
      <div className='flex__item--grow-1'>{ note.text }</div>
    </div>
  );
};

Note.propTypes = {
  note: PropTypes.object
}

export default withRouter(connect(
  (state) => ({ conversation: state.conversations.conversation })
)(Conversation));

const test = {
  "id": "d86b83f6-97c6-4743-b424-c5593511a0ba",
  "subject": "Moor Test",
  "notes": [
    {
      "text": "Just testing more of this stuff",
      "sent": "2021-07-27T22:45:40.803236",
      "from": {
        "id": "1b10a09d-d342-4eee-a9eb-c99acd2dde17",
        "name": "Earthdata Pub System",
        "email": "no_email"
      }
    }
  ]
}
