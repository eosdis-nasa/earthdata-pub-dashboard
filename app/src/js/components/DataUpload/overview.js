'use strict';
import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import _config from '../../config';
import { loadToken } from '../../utils/auth';
import localUpload from 'edpub-data-upload-utility';
import { listFileUploadsBySubmission, listFileDownloadsBySubmission } from '../../actions';

class UploadOverview extends React.Component {
  constructor() {
    super();
    this.state = { loaded: false, hiddenFileInput: React.createRef(null), statusMsg: 'Select a file', uploadFile: '', key: '' };
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getFileList = this.getFileList.bind(this);
    this.validateFile = this.validateFile.bind(this);
    this.resetInputWithTimeout = this.resetInputWithTimeout.bind(this);
    this.getDownloadList = this.getDownloadList.bind(this);
    
  }

  getDownloadList() {
    const { dispatch } = this.props;
    const { requestId } = this.props.match.params;

    if (requestId !== '' && requestId != undefined && requestId !== null) {
      if (this.state.key !== ''){
        dispatch(listFileDownloadsBySubmission(requestId))
          .then(() => {
            const download = new localUpload();
            const { requestId } = this.props.match.params;
            const { apiRoot } = _config;
            if (requestId !== '' && requestId != undefined && requestId !== null) {
              const payload = (this.state.key, `${apiRoot}data/upload/downloadUrl/${this.state.key}`, loadToken().token)
              // s3://bucket_name/path/to/file.txt
              download.downloadFile(payload).then((resp) => {
                localStorage.removeItem('key')
                console.log('key is ' + this.state.key)
                if (resp.error) {
                  console.log(`An error has occured: ${resp.error}.`);
                } else {
                  console.log('no errors', resp)
                }
              })
            }
        });
      }
    }
  }

  getFileList() {
    const { dispatch } = this.props;
    const { requestId } = this.props.match.params;
    if (requestId !== '' && requestId != undefined && requestId !== null) {
      dispatch(listFileUploadsBySubmission(requestId))
        .then((resp) => {
          const bucket = '15df4fda-ed0d-417f-9124-558fb5e5b561';
          const userId = 'c259a741-1822-48a9-b6c3-9a4ecaac0338';
          resp = {
            id: `${requestId}`,
            type: 'REQUEST',
            data: [
              {
                key: `${bucket}/${requestId}/${userId}/Some_really_really_long_list_name_of_filename.png`,
                size: 34828,
                last_modified: '2023-07-05T19:44:08.000Z',
                file_name: 'Some_really_really_long_list_name_of_filename.png'
              },
              {
                key: `${bucket}/${requestId}/${userId}/home.png`,
                size: 435471,
                last_modified: '2023-07-20T21:13:30.000Z',
                file_name: 'home.png'
              }
            ],
            config: {
              json: true,
              resolveWithFullResponse: true,
              simple: false,
              type: 'REQUEST',
              method: 'GET',
              id: `${requestId}`,
              path: `data/upload/list/${requestId}`,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${loadToken().token}`
              },
              url: `https://pub.sit.earthdata.nasa.gov/api/data/upload/list/${requestId}`
            }
          };
          if (resp.data.error) {
            const str = `An error has occurred while getting the list of files: ${resp.data.error}.`;
          } else {
            document.getElementById('previously-saved').replaceChildren();
            const dataArr = resp.data;
            for (const ea in dataArr) {
              const fileName = dataArr[ea].file_name;
              if (dataArr[ea]=== undefined || fileName === undefined){
                break
              }
              const key = dataArr[ea].key;
              this.setState({ key: key });
              const lastModified = dataArr[ea].last_modified;
              const size = dataArr[ea].size;
              if (typeof lastModified !== 'undefined') {
                const date = new Date(lastModified).toISOString().split('T')[0];
                const datetime = date.toLocaleString();
              }
              const url = resp.config.url;
              const str = `<span id="${key}" name="${fileName}" ariaLabel="Download ${key}">${fileName}</span><br>`;
              if (document.getElementById('previously-saved') !== null) {
                document.getElementById('previously-saved').innerHTML += `${str}`;
              }
            }
          }
        });
    }
  }

  componentDidMount() {
    this.getFileList()
    this.getDownloadList()
  }

  handleClick(e) {
    e.preventDefault();
    this.resetInputWithTimeout(undefined, 0)
    this.state.hiddenFileInput?.current?.click();
  };

  resetInputWithTimeout(msg, timeout){
    setTimeout(() => {
      msg ? this.setState({ statusMsg: msg }) : null
      if (this.state.hiddenFileInput.current === null || this.state.hiddenFileInput === null) {
        this.setState({ hiddenFileInput: React.createRef(null) });
      }
    }, timeout);
  }

  validateFile(file){
    let valid = false;
    if (file.name.match(/\.([^\.]+)$/) !== null){
      var ext = file.name.match(/\.([^\.]+)$/)[1];
      if (ext.match(/exe/gi)) {
        this.setState({ statusMsg: 'exe is an invalid file type.' });
        this.resetInputWithTimeout('Please select a different file.', 2000)
      } else {
        valid = true
      }
    } else {
      this.setState({ statusMsg: 'The file must have an extension.' });
      this.resetInputWithTimeout('Please select a different file.', 2000)
    }
    return valid;
  }
  
  async handleChange(e) {
    e.preventDefault();
    const file = e.target.files[0];
    if(this.validateFile(file)){
      this.setState({ statusMsg: 'Uploading' });
      const upload = new localUpload();
      const { requestId } = this.props.match.params;
      const { apiRoot } = _config;
      if (requestId !== '' && requestId != undefined && requestId !== null) {
        const payload = {
          fileObj: file,
          apiEndpoint: `${apiRoot}data/upload/getPostUrl`,
          authToken: loadToken().token,
          submissionId: requestId
        }
        await upload.uploadFile(payload).then((resp) => {
          this.setState({ statusMsg: 'Uploading' });
          if (resp.error) {
            console.log(`An error has occured: ${resp.error}.`);
            this.resetInputWithTimeout('Select a file', 1000)
          } else {
            this.setState({ statusMsg: 'Upload Complete' });
            this.getFileList();
            this.resetInputWithTimeout('Select another file', 1000)
          }
        })
      }
    }
  };

  render() {
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
              <br></br><label className='heading--medium' htmlFor='hiddenFileInput' style={{ marginBottom: '1rem' }}>{`${this.state.statusMsg}`}
                <input
                  onChange={(e) => this.handleChange(e)}
                  type="file"
                  multiple={false}
                  style={{ display: 'none' }}
                  ref={this.state.hiddenFileInput}
                  id="hiddenFileInput" />
              </label>
              <button onClick={(e) => this.handleClick(e)} className={'button button--submit button__animation--md button__arrow button__arrow--md button__animation button__arrow--white'}>Upload File</button>
            </div>
          </div>
        </div></>
      );
  }
}

UploadOverview.propTypes = {
  stats: PropTypes.object,
  dispatch: PropTypes.func,
  config: PropTypes.object
};

export default withRouter(connect(state => ({
  stats: state.stats,
  config: state.config
}))(UploadOverview));