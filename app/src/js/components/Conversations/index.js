'use strict';
import React from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import PropTypes from 'prop-types';
import ConversationsOverview from './overview';
import Conversation from './conversation';

const Conversations = ({ location, params }) => {
  return (
    <div className='page__conversations'>
      <div className='content__header'>
        <div className='row'>
          <h1 className='heading--xlarge'>Conversations</h1>
        </div>
      </div>
      <div className='page__content'>
        <div className='wrapper__sidebar'>
          <Sidebar
            currentPath={location.pathname}
            params={params}
          />
          <Switch>
            <Route exact path='/conversations' component={ConversationsOverview} />
            <Route path='/conversations/id/:conversationId' component={Conversation} />
          </Switch>
        </div>
      </div>
    </div>
  );
}

Conversations.propTypes = {
  children: PropTypes.object,
  location: PropTypes.object,
  params: PropTypes.object
};

export default withRouter(Conversations);
