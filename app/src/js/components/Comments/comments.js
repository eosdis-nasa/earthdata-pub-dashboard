'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  getRequest,
  replyConversation,
  getForm,
  getStepConversation,
  getUser,
  getRole
} from '../../actions';
import Loading from '../LoadingIndicator/loading-indicator';
import { requestPrivileges, formPrivileges, notePrivileges } from '../../utils/privileges';
import SearchModal from '../SearchModal';

class Comment extends React.Component {
  constructor() {
    super();
    this.displayName = 'Comment';
    this.state = { 
      textRef: React.createRef(), 
      showSearch: false, 
      searchType: 'user', 
      commentViewers: [], 
      commentViewerRoles: [],
      idMap: {} 
    };

    this.openSearch = this.openSearch.bind(this);
    this.closeSearch = this.closeSearch.bind(this);
    this.addViewer = this.addViewer.bind(this);
    this.addRole = this.addRole.bind(this)
  }

  async componentDidMount() {
    const search = this.props.location.search.split('=');
    let requestId = '';
    if (search[1] !== undefined) {
      requestId = search[1].replace(/&step/g, '');
    }
    const step = search[2];
    const { dispatch } = this.props;
    const { formId } = this.props.match.params;
    await dispatch(getRequest(requestId));
    await dispatch(getForm(formId, this.props.requests.detail.data.daac_id));
    let reviewStepName = `${this.props.forms.map[formId].data.short_name}_form_review`;
    if (this.props.requests.detail.data.conversation_id) {
      if (typeof this.props.forms.map[formId].data.short_name === 'undefined' && typeof step !== 'undefined') {
        reviewStepName = step;
      } else if (typeof this.props.forms.map[formId].data.short_name === 'undefined') {
        reviewStepName = '';
      }
      const payload = { conversation_id: this.props.requests.detail.data.conversation_id, level: true, step_name: reviewStepName };
      await dispatch(getStepConversation(payload)).then(() => {
        for (const ea in this.props.conversations.conversation.data.notes) {
          const note = this.props.conversations.conversation.data.notes[ea].text.split('Comment: ')[1];
          const author = this.props.conversations.conversation.data.notes[ea].from.name;
          const viewer_users = this.props.conversations.conversation.data.notes[ea].viewers.users;
          const viewer_roles = this.props.conversations.conversation.data.notes[ea].viewers.roles;
          let viewers = [];
          viewer_users && viewer_users.forEach( function(user){
            viewers.push(user.name)
          })
          viewer_roles && viewer_roles.forEach( function(role){
            viewers.push(role.name)
          })

          const viewer_str = viewers && viewers.length ? `, Viewers: ${viewers.join(", ")}` : "";

          if (document.getElementById('previously-saved') !== null && typeof note !== 'undefined') {
            document.getElementById('previously-saved').innerHTML += `${note}, From: ${author} ${viewer_str}<br>`;
          }
        }
      });
    }
  }

  getFormalName(str) {
    if (typeof str === 'undefined') return '';
    const count = (str.match(/_/g) || []).length;
    if (count > 0) {
      str = str.replace(/_/g, ' ');
    }
    const words = str.split(' ');
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }
    return words.join(' ');
  }

  formatComments() {
    if (document.querySelectorAll('textarea#comment') !== undefined && document.querySelectorAll('textarea#comment')[0] !== undefined && document.querySelectorAll('textarea#comment')[0].value !== '') {
      document.querySelectorAll('textarea#comment')[0].placeholder = 'Enter a comment';
      document.querySelectorAll('textarea#comment')[0].classList.remove('required');
    }
  }

  hasStepData() {
    if (typeof this.props.requests !== 'undefined' &&
      typeof this.props.requests.detail.data !== 'undefined' &&
      typeof this.props.requests.detail.data.step_data !== 'undefined') {
      return true;
    } else {
      return false;
    }
  }

  reply(requestName, id, stepName, step) {
    const { dispatch } = this.props;
    if (this.state.textRef.current.value !== '') {
      const date = new Date();
      const datetime = date.toLocaleString();
      const comment = `${datetime} - ${this.state.textRef.current.value}`;
      const reply = `${requestName} - Step: ${stepName}, Comment: ${comment}`;
      const resp = reply.replace(/[\n\t\r\'\"]/g, '\\$&');
      // if the user has chosen to specify viewers, ensure that they are one of them
      const current_user = JSON.parse(window.localStorage.getItem('auth-user'));
      const viewer_user_list = [...this.state.commentViewers];
      let viewerList = Object.values(this.state.idMap);
      if (!this.state.commentViewers.includes(current_user.id) && 
        (this.state.commentViewers.length || this.state.commentViewerRoles.length)){
          viewer_user_list.push(current_user.id); 
          viewerList.push(current_user.name);
        
      } 
      const payload = { conversation_id: id, text: resp, step_name: step , viewer_users: viewer_user_list, viewer_roles: this.state.commentViewerRoles};
      dispatch(replyConversation(payload));
      const author = current_user.name;
      const viewer_str = viewerList && viewerList.length ? `, Viewers: ${viewerList.join(", ")}` : "";
      document.getElementById('previously-saved').innerHTML += `${datetime} - ${this.state.textRef.current.value}, From: ${author}${viewer_str}<br>`;
      this.state.textRef.current.value = '';
      this.setState({ commentViewers: []})
      this.setState({ commentViewerRoles: []})
      this.setState({ idMap: {}})
      localStorage.setItem(`${this.props.requests.detail.data.id}_${step}`, 'saved');
      document.querySelectorAll('button.button--reply')[0].classList.add('hidden');
    }
  }

  async openSearch(searchEntity) {
    this.setState({ searchType: searchEntity});
    this.setState({ showSearch: true });
  }

  async closeSearch() {
    this.setState({ showSearch: false });
  }

  async addViewer(id) {
    if (!this.state.commentViewers.includes(id)){
      const { dispatch } = this.props;
      await dispatch(getUser(id)).then( (user) =>{
        let mapCopy = { ...this.state.idMap }; 
        mapCopy[id] = user.data.name;
        this.setState({idMap: mapCopy});
        this.setState({ commentViewers: [...this.state.commentViewers, id]})
      })
    }

    this.setState({ showSearch: false });
  };

  async addRole(id) {
    if (!this.state.commentViewerRoles.includes(id)){
      const { dispatch } = this.props;
      await dispatch(getRole(id)).then( (role) =>{
        let mapCopy = { ...this.state.idMap }; 
        mapCopy[id] = role.data.long_name;
        this.setState({idMap: mapCopy});
        this.setState({ commentViewerRoles: [...this.state.commentViewerRoles, id]})

      })
    }
    
    this.setState({ showSearch: false });
  };

  async removeViewer(viewerId, viewerType) {
    switch(viewerType){
      case "user":
          const newViewers = this.state.commentViewers.filter((viewer) => viewer !== viewerId);
          this.setState({ commentViewers: newViewers })
        break;
      case "role":
        const newRoles = this.state.commentViewerRoles.filter((viewer) => viewer !== viewerId);
        this.setState({ commentViewerRoles: newRoles })
        break;
    }

    const mapCopy = { ...this.state.idMap };
    delete mapCopy[viewerId];
    this.setState({idMap: mapCopy});
  };

  render() {
    let reviewable = false;
    let sameFormAsStep = false;
    const search = this.props.location.search.split('=');
    let requestId = '';
    if (search[1] !== undefined) {
      requestId = search[1].replace(/&step/g, '');
    }
    let step = search[2];
    let stepName = this.getFormalName(step);
    let { canReview } = requestPrivileges(this.props.privileges, step);
    const { canAddUser, canRemoveUser } = notePrivileges(this.props.privileges);
    let request = '';
    let conversationId = '';
    let requestName = '';
    const formId = this.props.match.params.formId;
    let formName = '';
    request = this.props.requests.detail.data;
    const searchOptions = {
      user: {
        entity: 'user',
        submit: this.addViewer,
        cancel: this.closeSearch
      },
      role: {
        entity: 'role',
        submit: this.addRole,
        cancel: this.closeSearch
      }
    };
    if (this.hasStepData() && request !== undefined) {
      if (this.props.forms.map !== undefined && this.props.forms.map[formId] !== undefined && this.props.forms.map[formId].data !== undefined) {
        formName = this.props.forms.map[formId].data.short_name;
        if (this.props.requests.detail.data.forms !== null) {
          if (step === undefined) {
            step = this.props.requests.detail.data.step_name;
            stepName = this.getFormalName(step);
          }
          if (this.props.requests.detail.data.form_data?.data_product_name_value) {
            requestName = this.props.requests.detail.data.form_data.data_product_name_value;
          } else {
            requestName = requestId;
          }
        }
        conversationId = this.props.requests.detail.data.conversation_id;
        if (this.props.requests.detail.data.step_name?.match(/close/g)) {
          sameFormAsStep = false;
          canReview = false;
        }
        if (this.props.requests.detail.data.step_name === `${formName}_form`) {
          sameFormAsStep = true;
          canReview = false;
        } else if (this.props.requests.detail.data.step_name?.match(/form_(.*_)?review/g)) {
          if (canReview) {
            reviewable = true;
          }
          const regexStr = new RegExp(`${formName}_form_(.*_)?review`, 'g');
          if (this.props.requests.detail.data.step_name?.match(regexStr)) {
            sameFormAsStep = true;
          }
        } else if (window.location.href.match(/approval/g)) {
          reviewable = true;
          sameFormAsStep = true;
        }
      }
    }
    if (!request || request.inflight || !this.props.conversations.conversation.data.notes) {
      return <Loading />;
    } else {
      if (conversationId === '') {
        conversationId = this.props.conversations.conversation.data.id;
      }
      return (
        <section className='page_section'>
          {this.state.showSearch && <SearchModal {...searchOptions[this.state.searchType]} />}
          {typeof requestId !== 'undefined' &&
            <form className='flex__column flex__item--grow-1'
              onSubmit={(e) => { e.preventDefault(); this.reply(requestName, conversationId, stepName, step); }}>
              <span id='previously-saved' style={{ padding: '0.3em 2em 0.4em 0.7em' }}></span>
              {requestId !== '' && reviewable && sameFormAsStep
                ? <><textarea placeholder='Enter a comment'
                  ref={this.state.textRef}
                  id='comment'
                  aria-label="Enter a comment"
                  title="Enter a comment"
                  onChange={(e) => { e.preventDefault(); this.formatComments(); document.querySelectorAll('button.button--reply')[0].classList.remove('hidden'); }}
                ></textarea>
                  <p>Comment Visibility:</p>
                  { this.state.commentViewers && this.state.commentViewers.map((viewer) => {
                    return (
                      <div key={viewer} className='flex__row sm-border'>
                        <div className='flex__item--w-25'>
                          {this.state.idMap[viewer]}
                        </div>
                        <div className='flex__item--w-15'>
                          {canRemoveUser &&
                            <button
                              className='button button--remove button__animation--md button__arrow button__arrow--md button__animation'
                              onClick={(e) => { e.preventDefault(); this.removeViewer(viewer, 'user'); }}
                              >
                              Remove
                            </button>
                          }
                        </div>
                      </div>
                    )}
                  )}
                  { this.state.commentViewerRoles && this.state.commentViewerRoles.map((viewer) => {
                    return (
                      <div key={viewer} className='flex__row sm-border'>
                        <div className='flex__item--w-25'>
                          {this.state.idMap[viewer]}
                        </div>
                        <div className='flex__item--w-15'>
                          {canRemoveUser &&
                            <button
                              className='button button--remove button__animation--md button__arrow button__arrow--md button__animation'
                              onClick={(e) => { e.preventDefault(); this.removeViewer(viewer, 'role') }}
                              >
                              Remove
                            </button>
                          }
                        </div>
                      </div>
                    )}
                  )}
                  { canAddUser &&
                    <div className='flex__row'>
                      <div className='flex__item--spacing'>
                        <button type='button'
                          className='button button--add button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'
                          onClick={() => this.openSearch('user')}
                        >
                          Add Viewer
                        </button>
                      </div>
                      <div className='flex__item--spacing'>
                        <button type='button'
                          className='button button--add button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'
                          onClick={() => this.openSearch('role')}
                          >
                          Add Viewer Role
                        </button>
                      </div>
                    </div>
                  }
                  <div style={{ minHeight: '40px' }}>
                    <button type='submit'
                      className='button button--reply form-group__element--right button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'>
                      Save Comment
                    </button>
                  </div></>
                : null
              }
            </form>
          }
        </section>
      );
    }
  }
}

Comment.propTypes = {
  match: PropTypes.object,
  dispatch: PropTypes.func,
  requests: PropTypes.object,
  forms: PropTypes.object,
  conversations: PropTypes.object,
  logs: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  privileges: PropTypes.object,
  params: PropTypes.object
};

export default withRouter(connect(state => ({
  forms: state.forms,
  conversations: state.conversations,
  requests: state.requests,
  privileges: state.api.tokens.privileges,
  logs: state.logs
}))(Comment));
