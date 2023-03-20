'use strict';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';

import {
  getPutUrl
} from '../../actions';
import { strings } from '../locale';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { createMD5 } from 'hash-wasm';

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

const UploadOverview = ({signedPut}) => {

  const [statusMsg, setStatusMsg] = useState('Select a file')
  const [uploadFileTest, setUploadFileTest] = useState('')

  const chunkSize = 64 * 1024 * 1024;
  const fileReader = new FileReader();
  let hasher = null;
  let fileHash = ''
  let uploadFile = ''

  const dispatch = useDispatch();

  const put = async (url, data) =>{
    console.log(uploadFileTest)
    const resp = await fetch(url, {
      method:'PUT',
      headers:{
        "Content-Type":uploadFileTest.type
      },
      body:uploadFileTest
    });
    return resp
  }

  const hashChunk = (chunk) =>{
    return new Promise((resolve, reject) =>{
      fileReader.onload = async(e) => {
        const view = new Uint8Array(e.target.result);
        hasher.update(view);
        resolve();
      }

      fileReader.readAsArrayBuffer(chunk);
    });
  }

  const readFile = async(file) => {
    if (hasher){
      hasher.init();
    } else {
      hasher = await createMD5();
    }

    const chunkNumber = Math.floor(file.size / chunkSize);

    for (let i = 0; i <= chunkNumber; i++){
      const chunk = file.slice(
        chunkSize * i,
        Math.min(chunkSize * (i+1), file.size)
      );
      await hashChunk(chunk);
    }
    const hash = hasher.digest();
    return Promise.resolve(hash);
  }

  const hiddenFileInput = React.createRef(null);
  const handleClick = event =>{
    hiddenFileInput.current.click();
  }

  const handleChange = async event => {
    setStatusMsg('Preparing for Upload')
    const newFile = event.target.files[0];
    console.log(newFile)
    uploadFile = newFile
    setUploadFileTest(newFile)
    fileHash = await readFile(newFile);
    const payload = {
      file_name: uploadFile.name,
      file_type: uploadFile.type,
      checksum_value: fileHash
    };
    dispatch(getPutUrl(payload));
  }

  useEffect(async () => {
    if(signedPut !== { }){
      setStatusMsg('Uploading')
      await put(signedPut.url, uploadFile)
      setStatusMsg('Select a file')
    }
  }, [signedPut]);

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
      <hi>{`${statusMsg}`}</hi>
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
