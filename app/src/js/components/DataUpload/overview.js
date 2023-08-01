'use strict';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import _config from '../../config';
import { loadToken } from '../../utils/auth';
import localUpload from 'edpub-data-upload-utility';
import { listFileUploadsBySubmission } from '../../actions';

class UploadOverview extends React.Component {
  constructor () {
    super();
    this.state = { loaded: false, files: '', hiddenFileInput: React.createRef(null), statusMsg: 'Select a file', uploadFile: '' };
    /* const [statusMsg, setStatusMsg] = useState('Select a file');
    const [uploadFile, setUploadFile] = useState('');
    const [submissionId, setSubmissionId] = useState(''); */
    this.updateFileList = this.updateFileList.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  updateFileList () {
    const { dispatch } = this.props;
    let submissionId = '';
    if (window.location.href.indexOf('requests/id') >= 0) {
      submissionId = window.location.href.split(/requests\/id\//g)[1];
      if (submissionId.indexOf('&') >= 0) {
        submissionId = submissionId.split(/&/g)[0];
      }
    }
    if (submissionId !== '' && submissionId != undefined && submissionId !== null) {
      dispatch(listFileUploadsBySubmission(submissionId)).then(resp => {
        /* const bucket = '15df4fda-ed0d-417f-9124-558fb5e5b561';
        const userId = 'c259a741-1822-48a9-b6c3-9a4ecaac0338';
         resp = {
          "id": `${submissionId}`,
          "type": "REQUEST",
          "data": [
            {
              "key": `${bucket}/${submissionId}/${userId}/DAAC_logo_avatar.png`,
              "size": 34828,
              "last_modified": "2023-07-05T19:44:08.000Z",
              "file_name": "DAAC_logo_avatar.png"
            },
            {
              "key": `${bucket}/${submissionId}/${userId}/home.png`,
              "size": 435471,
              "last_modified": "2023-07-20T21:13:30.000Z",
              "file_name": "home.png"
            }
          ],
          "config": {
            "json": true,
            "resolveWithFullResponse": true,
            "simple": false,
            "type": "REQUEST",
            "method": "GET",
            "id": `${submissionId}`,
            "path": `data/upload/list/${submissionId}`,
            "headers": {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${loadToken().token}`
            },
            "url": `https://pub.sit.earthdata.nasa.gov/api/data/upload/list/${submissionId}`
          }
        } */
        if (resp.error) {
          const str = `An error has occurred: ${resp.error}.  Please try again later.<br>`;
          this.setState({ files: this.state.files = `${str}` });
        } else {
          const dataArr = resp.data;
          for (const ea in dataArr) {
            const fileName = dataArr[ea].file_name;
            const key = dataArr[ea].key;
            const lastModified = dataArr[ea].last_modified;
            const size = dataArr[ea].size;
            const date = new Date(lastModified).toISOString().split('T')[0];
            const datetime = date.toLocaleString();
            const url = resp.config.url;
            const str = `<a target=_blank href="${url}" id="${key}" name="${fileName}" ariaLabel="Download ${key}">${fileName}</a><br>`;
            this.setState({ files: this.state.files += `${str}` });
          }
        }
      });
    }
  }

  async handleClick (e) {
    console.log('handle click function');
    e.preventDefault();
    if (this.state.hiddenFileInput.current === null || this.state.hiddenFileInput === null) {
      this.setState({ hiddenFileInput: React.createRef(null) });
    }
    await this.state.hiddenFileInput?.current?.click();
  }

  async handleChange (e) {
    console.log('handle change function');
    if (typeof e.target.files !== 'undefined') {
      e.preventDefault();
      this.setState({ statusMsg: 'Uploading' });
      const file = e.target.files[0];
      const upload = new localUpload();
      let submissionId = '';
      const { apiRoot } = _config;
      if (window.location.href.indexOf('requests/id') >= 0) {
        submissionId = window.location.href.split(/requests\/id\//g)[1];
        if (submissionId.indexOf('&') >= 0) {
          submissionId = submissionId.split(/&/g)[0];
        }
      }
      if (submissionId !== '' && submissionId != undefined && submissionId !== null) {
        const payload = {
          fileObj: file,
          apiEndpoint: `${apiRoot}data/upload/getPostUrl`,
          authToken: loadToken().token,
          submissionId
        };
        console.log('payload', payload)
        await upload.uploadFile(payload).then((resp) => {
          this.setState({ statusMsg: 'Uploading' });
          console.log('resp',resp)
          if (resp.error) {
            console.log(`An error has occured: ${resp.error}.`);
            setTimeout(() => {
              this.setState({ statusMsg: 'Select a file' });
              if (this.state.hiddenFileInput.current === null || this.state.hiddenFileInput === null) {
                this.setState({ hiddenFileInput: React.createRef(null) });
              }
            }, '1000');
          } else {
            this.setState({ statusMsg: 'Upload Complete' });
            console.log('upload complete')
            // this.updateFileList();
            setTimeout(() => {
              this.setState({ statusMsg: 'Select another file' });
              if (this.state.hiddenFileInput.current === null || this.state.hiddenFileInput === null) {
                this.setState({ hiddenFileInput: React.createRef(null) });
              }
            }, '1000');
          }
        });
      }
    }
  }

  render () {
    console.log('render function');
    //this.updateFileList();
    return (
      <><br></br>
        <div className='page__component'>
          <div className='page__section__header'>
            <h1 className='heading--small' aria-labelledby='Upload Data File'>
              Upload Data File
            </h1>
          </div>
          <div className='indented__details'>
            <span id='previously-saved' ref={this.state.files}></span>
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
