'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter
} from 'react-router-dom';
import {
  interval,
  getConversation
} from '../../actions';
import { get } from 'object-path';
import {
} from '../../utils/format';
import Loading from '../LoadingIndicator/loading-indicator';
import ErrorReport from '../Errors/report';
// import Metadata from '../Table/Metadata';
import Email from '../Table/Email';
import _config from '../../config';

const { updateInterval } = _config;

/* const permissionTableColumns = [
  {
    Header: 'Table Name',
    accessor: row => row
  }
];

const subscriptionTableColumns = [
  {
    Header: 'Table Name',
    accessor: row => row,
  }
];
*/
const metaAccessors = [
  {
    label: 'Sender Email',
    property: 'from.email'
  },
  {
    label: 'Sent',
    property: 'sent'
  },
  {
    label: 'Text',
    property: 'text'
  }
];

class ConversationOverview extends React.Component {
  constructor () {
    super();
    this.reload = this.reload.bind(this);
    this.navigateBack = this.navigateBack.bind(this);
    this.delete = this.delete.bind(this);
    this.errors = this.errors.bind(this);
  }

  componentDidMount () {
    const { conversationId } = this.props.match.params;
    const immediate = !this.props.conversations.map[conversationId];
    this.reload(immediate);
  }

  componentWillUnmount () {
    if (this.cancelInterval) { this.cancelInterval(); }
  }

  reload (immediate, timeout) {
    timeout = timeout || updateInterval;
    const conversationId = this.props.match.params.conversationId;
    const { dispatch } = this.props;
    if (this.cancelInterval) { this.cancelInterval(); }
    this.cancelInterval = interval(() => dispatch(getConversation(conversationId)), timeout, immediate);
  }

  navigateBack () {
    const { history } = this.props;
    history.push('/conversations');
  }

  // delete () {
  //   const { conversationId } = this.props.match.params;
  //   const conversation = this.props.conversations.map[conversationId].data;
  //   if (!conversation.published) {
  //     this.props.dispatch(deleteConversation(conversationId));
  //   }
  // }

  errors () {
    const conversationId = this.props.match.params.conversationId;
    return [
      get(this.props.conversations.map, [conversationId, 'error']),
      get(this.props.conversations.deleted, [conversationId, 'error'])
    ].filter(Boolean);
  }

  render () {
    const conversationId = this.props.match.params.conversationId;
    const record = this.props.conversations.map[conversationId];

    if (!record || (record.inflight && !record.data)) {
      return <Loading />;
    } else if (record.error) {
      return <ErrorReport report={record.error} truncate={true} />;
    }
    const conversation = record.data;

    const errors = this.errors();

    // const deleteStatus = get(this.props.conversations.deleted, [conversationId, 'status']);
    /* const dropdownConfig = [{
      text: 'Delete',
      action: this.delete,
      disabled: conversation.published,
      status: deleteStatus,
      success: this.navigateBack,
      confirmAction: true,
      confirmText: deleteText(conversationId)
    }]; */

    return (
      <div className='page__component'>
        <section className='page__section page__section__header-wrapper'>
          <h1 className='heading--large heading--shared-content with-description'>{conversationId}</h1>
          {/* <AsyncCommands config={dropdownConfig} />
          <Link
            className='button button--small button--green button--edit form-conversation__element--right'
            to={'/conversations/edit/' + conversationId}>Edit</Link> */}
        </section>

        <section className='page__section'>
          {errors.length ? <ErrorReport report={errors} truncate={true} /> : null}
          <div className='heading__wrapper--border' style={{ borderBottom: 'none' }}>
            <h2 className='heading--medium with-description'>Conversation Overview</h2>
          </div>
          { conversation.notes ? conversation.notes.map((note, i) =>
            <Email data={note} accessors={metaAccessors} key={i}/>
          ) : <div>Conversation Empty</div>}
        </section>

        {/* <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>Permissions</h2>
          </div>
          <Table
            data={conversation.permissions}
            tableColumns={permissionTableColumns}
          />
        </section>

        <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>Subscriptions</h2>
          </div>
          <Table
            data={conversation.subscriptions}
            tableColumns={subscriptionTableColumns}
          />
        </section> */}
      </div>
    );
  }
}

ConversationOverview.propTypes = {
  match: PropTypes.object,
  dispatch: PropTypes.func,
  conversations: PropTypes.object,
  logs: PropTypes.object,
  history: PropTypes.object
};

ConversationOverview.displayName = 'ConversationElem';

export default withRouter(connect(state => ({
  conversations: state.conversations,
  logs: state.logs
}))(ConversationOverview));
