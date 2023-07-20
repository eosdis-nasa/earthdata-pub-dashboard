'use strict';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import _config from '../../config';
import { loadToken } from '../../utils/auth';
import localUpload from 'edpub-data-upload-utility';
import { createMD5 } from 'hash-wasm';
import { listFileUploadsBySubmission, getDaac } from '../../actions';

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

const UploadOverview = () => {
  const [statusMsg, setStatusMsg] = useState('Select a file');
  const [uploadFile, setUploadFile] = useState('');
  const [fileHash, setFileHash] = useState('');
  const [submissionId, setSubmissionId] = useState('');
  let hiddenFileInput = React.createRef(null);

  const dispatch = useDispatch();
  const {apiRoot} = _config;

  const updateFileList = async () => {
    let submissionId = '';
    if (window.location.href.indexOf('requests/id') >= 0) {
      submissionId = window.location.href.split(/requests\/id\//g)[1];
      if (submissionId.indexOf('&') >= 0) {
        submissionId = submissionId.split(/&/g)[0];
      }
    }
    if (submissionId !== '' && submissionId != undefined && submissionId !== null) {
      /* dispatch(listFileUploadsBySubmission(submissionId)).then(value => {
        console.log(value)
        document.getElementById('previously-saved').innerHTML += `${value}<br>`;
      }); */
      dispatch(listFileUploadsBySubmission(submissionId)).then(resp => {
        if (resp.error) {
          console.log(`An error has occured: ${resp.error}.`);
        } else {
          console.log('str',JSON.stringify(resp))
          console.log(resp)
          //const date = new Date();
          //const datetime = date.toLocaleString();
          // const comment = `${datetime} - ${uploadFile.name}`;
          document.getElementById('previously-saved').innerHTML += `${JSON.stringify(resp)}<br>`;
        }
      });
    }
  };

  const handleClick = event => {
    if (hiddenFileInput.current === null || hiddenFileInput === null) {
      hiddenFileInput = React.createRef(null);
    }
    hiddenFileInput?.current?.click();
  };

  const handleChange = async event => {
    setStatusMsg('Uploading...');
    const file = event.target.files[0];
    const upload = new localUpload();
    let submissionId = '';
    if (window.location.href.indexOf('requests/id') >= 0) {
      submissionId = window.location.href.split(/requests\/id\//g)[1];
      if (submissionId.indexOf('&') >= 0) {
        submissionId = submissionId.split(/&/g)[0];
      }
    }
    if(submissionId !== '' && submissionId != undefined && submissionId !== null) {
      const payload = {
        fileObj: file, 
        apiEndpoint: `${apiRoot}data/upload/getPostUrl`, 
        authToken: loadToken().token,
        submissionId: submissionId
      }
      const resp = await upload.uploadFile(payload).then((resp) => {
        setStatusMsg('Uploading');
        if (resp.error){
          console.log(`An error has occured: ${resp.error}.`);
          setTimeout(() => {
            setStatusMsg('Select a file');
            if (hiddenFileInput.current === null || hiddenFileInput === null) {
              hiddenFileInput = React.createRef(null);
            }
          }, '5000');
        } else {
          setStatusMsg('Upload Complete');
          updateFileList();
          setTimeout(() => {
            setStatusMsg('Select another file');
            if (hiddenFileInput.current === null || hiddenFileInput === null) {
              hiddenFileInput = React.createRef(null);
            }
          }, '5000');
        }
      })
    }
  };

  return (
    <><br></br>
    <div className='page__component'>
      <div className='page__section__header'>
        <h1 className='heading--small' aria-labelledby='Upload Data File'>
          Upload Data File
        </h1>
      </div>
      <div className='indented__details'>
        <span id='previously-saved'></span>
        <div className='form__textarea'>
          <br></br><label className='heading--medium' htmlFor='hiddenFileInput' style={{ marginBottom: '1rem' }}>{`${statusMsg}`}
            <input
              onChange={handleChange}
              type="file"
              multiple={false}
              style={{ display: 'none' }}
              ref={hiddenFileInput}
              id="hiddenFileInput" />
          </label>
          <button onClick={handleClick} className={'button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'}>Upload File</button>
        </div>
      </div>
    </div></>
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
