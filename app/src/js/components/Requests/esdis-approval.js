'use strict';
 import React from 'react';
 import PropTypes from 'prop-types';
 import { connect } from 'react-redux';
 import { withRouter } from 'react-router-dom';
 import {
   getRequest,
   esdisReviewRequest
 } from '../../actions';
 import {
   lastUpdated,
 } from '../../utils/format';
 import { requestPrivileges } from '../../utils/privileges';
 import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
 import Comments from '../Comments/comments';
 
 class EsdisApprovalStep extends React.Component {
   constructor () {
     super();
     this.displayName = 'ApproveStep';
     this.navigateBack = this.navigateBack.bind(this);
   }
 
   componentDidMount () {
     const search = this.props.location.search.split('=');
     const requestId = search[1].replace(/&step/g, '');
     const { dispatch } = this.props;
     dispatch(getRequest(requestId));
   }
 
   formatComments (commentRequired) {
     if (document.querySelectorAll('textarea#comment') !== undefined && document.querySelectorAll('textarea#comment')[0] !== undefined) {
       const savedBefore = localStorage.getItem(`${this.props.requests.detail.data.id}_${this.props.requests.detail.data.step_name}`);
       const hasCurrentValue = document.querySelectorAll('textarea#comment')[0].value !== '';
       if (commentRequired && (savedBefore === null && !hasCurrentValue)) {
         document.querySelectorAll('textarea#comment')[0].placeholder = 'required';
         document.querySelectorAll('textarea#comment')[0].classList.add('required');
       } else {
         document.querySelectorAll('textarea#comment')[0].placeholder = 'Enter a comment';
         document.querySelectorAll('textarea#comment')[0].classList.remove('required');
       }
     }
   }
 
   async review (id, action, requireComment) {
     this.formatComments(requireComment);
     if (document.querySelectorAll('textarea#comment') !== undefined && document.querySelectorAll('textarea#comment')[0] !== undefined) {
       const savedBefore = localStorage.getItem(`${this.props.requests.detail.data.id}_${this.props.requests.detail.data.step_name}`);
       const re = new RegExp(document.querySelectorAll('textarea#comment')[0].value, 'i');
       const currentInboxValueInSaved = document.getElementById('previously-saved').innerHTML.match(re);
       const hasCurrentValue = document.querySelectorAll('textarea#comment')[0].value !== '';
       if (((requireComment && savedBefore === 'saved') || (requireComment && hasCurrentValue)) || !requireComment) {
         if (currentInboxValueInSaved == null) {
           document.querySelectorAll('button.button--reply')[0].click();
         }
         const { dispatch } = this.props;
         await dispatch(esdisReviewRequest(id, action));
         if (requireComment) {
           localStorage.removeItem(`${this.props.requests.detail.data.id}_${this.props.requests.detail.data.step_name}`);
         }
         window.location.href = `${window.location.origin}${window.location.pathname.split(/\/requests/)[0]}/requests`;
       }
     }
   }
 
   hasStepData () {
     if (typeof this.props.requests !== 'undefined' &&
       typeof this.props.requests.detail.data !== 'undefined' &&
       typeof this.props.requests.detail.data.step_data !== 'undefined') {
       return true;
     } else {
       return false;
     }
   }
 
   getFormalName (str) {
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
 
   navigateBack () {
     this.props.history.push('/requests');
   }
 
   render () {
     const search = this.props.location.search.split('=');
     const requestId = search[1].replace(/&step/g, '');
     const step = search[2];
     const stepName = this.getFormalName(step);
     const { canReview } = requestPrivileges(this.props.privileges, step);
     let request = '';
 
     if (this.hasStepData()) {
       request = this.props.requests.detail.data;
     }
 
     const breadcrumbConfig = [
       {
         label: 'Dashboard Home',
         href: '/'
       },
       {
         label: 'Requests',
         href: '/requests'
       },
       {
         label: 'Approve',
         href: '/requests/approve',
         active: true
       }
     ];
 
     return (
       <div className='page__component'>
         <section className='page__section page__section__controls'>
           <Breadcrumbs config={breadcrumbConfig} />
         </section>
         <section className='page__section'>
           <h1 className='heading--large heading--shared-content with-description width--three-quarters'>{requestId}</h1>
           {request && lastUpdated(request.last_change, 'Updated')}
           {request
             ? <dl className='status--process'>
               <dt>Request Status:</dt>
               <dd className={request.status}>{request.status}</dd>
             </dl>
             : null}
         </section>
         <section className='page__section'>
           <div className='heading__wrapper--border'>
             <h2 className='heading--medium with-description'><strong>Step</strong>:&nbsp;&nbsp;&nbsp;&nbsp;{stepName}</h2>
           </div>
         </section>
         {typeof requestId !== 'undefined'
           ? <><Comments /></>
           : null
         }
         <section className='page__section'>
           {canReview && typeof requestId !== 'undefined' && (
             <div className='flex__row reject-approve'>
               <div className='flex__item--spacing'>
                 <button onClick={() => this.navigateBack()}
                   className='button button--cancel button__animation--md button__arrow button__arrow--md button__animation button--secondary form-group__element--right'>
                   Cancel
                 </button>
               </div>
               <div className='flex__item--spacing'>
                 <button onClick={() => this.review(requestId, 'reassign', true)}
                   className='button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white form-group__element--right'>
                   Reassign
                 </button>
               </div>
               <div className='flex__item--spacing'>
                 <button onClick={() => this.review(requestId, 'reject', true)}
                   className='button button--remove button__animation--md button__arrow button__arrow--md button__animation button__arrow--white form-group__element--right'>
                   Reject
                 </button>
               </div>
               <div className='flex__item--spacing'>
                 <button onClick={() => this.review(requestId, 'approve', false)}
                   className='button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white form-group__element--right'>
                   Approve
                 </button>
               </div>
             </div>
           )}
         </section>
       </div>
     );
   }
 }
 
 EsdisApprovalStep.propTypes = {
   match: PropTypes.object,
   dispatch: PropTypes.func,
   requests: PropTypes.object,
   logs: PropTypes.object,
   history: PropTypes.object,
   location: PropTypes.object,
   privileges: PropTypes.object,
   params: PropTypes.object
 };
 
 export default withRouter(connect(state => ({
   requests: state.requests,
   privileges: state.api.tokens.privileges,
   logs: state.logs
 }))(EsdisApprovalStep));