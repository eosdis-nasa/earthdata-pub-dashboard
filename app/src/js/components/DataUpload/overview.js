'use strict';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import {
  // getCount,
  // searchUsers,
  // clearUsersSearch,
  // filterUsers,
  // clearUsersFilter,
  listUsers
} from '../../actions';
// import Overview from '../Overview/overview';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import crypto from 'crypto';

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

const UploadOverview = ({ users, privileges }) => {
  const dispatch = useDispatch();

  const hiddenFileInput = React.createRef(null);
  const handleClick = event =>{
    hiddenFileInput.current.click();
  }
  const handleChange = event => {
    const fileUpload = event.target.files[0];
    const reader = new FileReader()

    reader.onload = () => {
      console.log("made it")
      const binary = reader.result;
      console.log(binary)
      const test = crypto.createHash('md5')
      console.log(test)
      const update = test.update("test operation")
      console.log(update)
      const md5Hash = update.digest('base64');
      console.log(md5Hash)
    }
    reader.readAsBinaryString(fileUpload)
    console.log(fileUpload);
  }

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
          <h1 className='heading--large heading--shared-content with-description '>{strings.user_overview}</h1>
        </div>
      </section>
      <section className='page__section'>
        <div className='heading__wrapper--border'/>
        <input 
          onChange={handleChange}
          type = "file"
          style={{display:"none"}}
          multiple={false}
          ref={hiddenFileInput}
        />
        <button onClick={handleClick}>Upload File</button>
      </section>
    </div>
  );
};

UploadOverview.propTypes = {
  users: PropTypes.object,
  stats: PropTypes.object,
  dispatch: PropTypes.func,
  config: PropTypes.object,
  privileges: PropTypes.object
};

export { UploadOverview };

export default withRouter(connect(state => ({
  stats: state.stats,
  users: state.users,
  privileges: state.api.tokens.privileges,
  config: state.config
}))(UploadOverview));
