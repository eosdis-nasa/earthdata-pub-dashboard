'use strict';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
//import {
//} from '../../actions';
// import Overview from '../Overview/overview';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

const breadcrumbConfig = [
  {
    label: 'Dashboard Home',
    href: '/'
  },
  {
    label: 'Upload',
    active: true
  }
];

const Upload = ({ users, privileges }) => {
  const dispatch = useDispatch();
  //useEffect(() => {
  //  dispatch(listUsers());
  //}, [users.searchString, dispatch]);
  return (
    <div className='page__component'>
      <section className='page__section page__section__controls'>
        <Breadcrumbs config={breadcrumbConfig} />
      </section>
      <section className='page__section page__section__header-wrapper'>
        <div className='page__section__header'>
          
        </div>
      </section>
      <section className='page__section'>
        
      </section>
    </div>
  );
};

Upload.propTypes = {
  stats: PropTypes.object,
  dispatch: PropTypes.func,
  config: PropTypes.object,
  privileges: PropTypes.object
};

export { Upload };

export default withRouter(connect(state => ({
  stats: state.stats,
  privileges: state.api.tokens.privileges,
  config: state.config
}))(Upload));
