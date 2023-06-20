'use strict';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import _config from '../../config';
import {
  getPutUrl
} from '../../actions';
import { loadToken } from '../../utils/auth';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { createMD5 } from 'hash-wasm';
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
  const [uploadFile, setUploadFile] = useState('');
  const [fileHash, setFileHash] = useState('');
  let hiddenFileInput = React.createRef(null);
  const chunkSize = 64 * 1024 * 1024;
  const fileReader = new FileReader();
  let hasher = null;

  const dispatch = useDispatch();

  const put = async (url) => {
    const resp = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': uploadFile.type
      },
      body: uploadFile
    }).then((resp) => {
      if (resp.status !== 200) {
        setStatusMsg('Select a file');
      } else {
        setStatusMsg('Upload Complete');
        setTimeout(() => {
          setStatusMsg('Select another file');
          hiddenFileInput = React.createRef(null);
        }, '5000');
      }
    });
    return resp;
  };

  const hashChunk = (chunk) => {
    return new Promise((resolve, reject) => {
      fileReader.onload = async (e) => {
        const view = new Uint8Array(e.target.result);
        hasher.update(view);
        resolve();
      };

      fileReader.readAsArrayBuffer(chunk);
    });
  };

  const readFile = async (file) => {
    if (hasher) {
      hasher.init();
    } else {
      hasher = await createMD5();
    }

    const chunkNumber = Math.floor(file.size / chunkSize);

    for (let i = 0; i <= chunkNumber; i++) {
      const chunk = file.slice(
        chunkSize * i,
        Math.min(chunkSize * (i + 1), file.size)
      );
      await hashChunk(chunk);
    }
    const hash = hasher.digest();
    return Promise.resolve(hash);
  };

  const handleClick = event => {
    hiddenFileInput.current.click();
  };

  const handleChange = async event => {
    setStatusMsg('Preparing for Upload');
    const file = event.target.files[0];
    setUploadFile(file);
    const upload = new localUpload();
    console.log(loadToken().token)
    const resp = await upload.uploadFile({
      file, 
      apiEndpoint: `${apiRoot}data/upload/getPutUrl`, 
      authToken: loadToken().token
    });
    console.log(resp);
    // const hash = await readFile(file);
    // setFileHash(hash);
    // const payload = {
    //   file_name: file.name,
    //   file_type: file.type,
    //   checksum_value: hash
    // };
    // setStatusMsg('Uploading');
    // dispatch(getPutUrl(payload));
  };

  // useEffect(async () => {
  //   if (signedPut !== {}) {
  //     await put(signedPut.url);
  //   } 
  // }, [signedPut]);

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
