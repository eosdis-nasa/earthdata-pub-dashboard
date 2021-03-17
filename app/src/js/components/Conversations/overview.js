'use strict';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { lastUpdated } from '../../utils/format';
import {
  listConversations,
  // searchConversations,
  // clearConversationsSearch
} from '../../actions';
import List from '../Table/Table';
// import Search from '../Search/search';
import { tableColumns } from '../../utils/table-config/conversations';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

const breadcrumbConfig = [
  {
    label: 'Dashboard Home',
    href: '/'
  },
  {
    label: 'Conversations',
    active: true
  }
];

const ConversationOverview = ({ conversations }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(listConversations());
  }, [conversations.searchString, dispatch]);
  const { queriedAt } = conversations.list.meta;
  return (
    <div className='page__component'>
      <section className='page__section page__section__controls'>
        <Breadcrumbs config={breadcrumbConfig} />
      </section>
      <section className='page__section page__section__header-wrapper'>
        <div className='page__section__header'>
          <h1 className='heading--large heading--shared-content with-description '>{strings.conversation_overview}</h1>
          {lastUpdated(queriedAt)}
        </div>
      </section>
      <section className='page__section'>
        <div className='heading__wrapper--border'>
          <h2 className='heading--medium heading--shared-content with-description'>{strings.all_conversations} <span className='num--title'>{conversations.list.data.length}</span></h2>
        </div>
        {/* Someone needs to define the search parameters for workflows, e.g. steps, etc. } */}
        {/* <div className='filters'>
          <Search
            dispatch={dispatch}
            action={searchConversations}
            clear={clearConversationsSearch}
            label='Search'
            placeholder="Conversation Name"
          />
        </div> */}

        <List
          list={conversations.list}
          dispatch={dispatch}
          action={listConversations}
          tableColumns={tableColumns}
          query={{}}
          sortIdx='name'
          rowId='name'
        />
      </section>
    </div>
  );
};

ConversationOverview.propTypes = {
  dispatch: PropTypes.func,
  conversations: PropTypes.object
};

export default withRouter(connect(
  (state) => ({ conversations: state.conversations })
)(ConversationOverview));
