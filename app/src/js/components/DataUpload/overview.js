'use strict';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import _config from '../../config';
import { loadToken } from '../../utils/auth';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import localUpload from 'edpub-data-upload-utility';

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

const {apiRoot} = _config;

const UploadOverview = ({ signedPut }) => {
  const [statusMsg, setStatusMsg] = useState('Select a file');
  let hiddenFileInput = React.createRef(null);

  // const dispatch = useDispatch();

  const handleClick = event => {
    hiddenFileInput.current.click();
  };

  const handleChange = async event => {
    setStatusMsg('Uploading...');
    const file = event.target.files[0];
    const upload = new localUpload();
    console.log(loadToken().token)
    const resp = await upload.uploadFile({
      fileObj: file, 
      apiEndpoint: `${apiRoot}data/upload/getPostUrl`, 
      authToken: loadToken().token
    });
    if(resp === 'Upload successfull'){
      setStatusMsg('Upload Complete');
    }
  };

  return (
    <div className='page__component'>
      <section className='page__section page__section__controls'>
        <Breadcrumbs config={breadcrumbConfig} />
      </section>
      <div className='heading__wrapper--border'>
        <h1 className='heading--medium heading--shared-content with-description'>Data Files</h1>
      </div>
      <div className='form__textarea'>
        <label className='heading--medium' htmlFor='hiddenFileInput' style={{ marginBottom: '1rem' }}>{`${statusMsg}`}
          <input
            onChange={handleChange}
            type = "file"
            multiple={false}
            style={{ display: 'none' }}
            ref={hiddenFileInput}
            id="hiddenFileInput"
          />
        </label>
        <button onClick={handleClick} className={'button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'}>Upload File</button>
      </div>
    </div>
  );
};

UploadOverview.propTypes = {
  stats: PropTypes.object,
  dispatch: PropTypes.func,
  config: PropTypes.object,
  signedPut: PropTypes.object
};

export { UploadOverview };

export default withRouter(connect(state => ({
  stats: state.stats,
  config: state.config,
  signedPut: state.dataUpload.detail.data
}))(UploadOverview));
