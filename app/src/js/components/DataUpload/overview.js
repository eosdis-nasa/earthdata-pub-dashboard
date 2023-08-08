'use strict';
import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import _config from '../../config';
import { loadToken } from '../../utils/auth';
import Loading from '../LoadingIndicator/loading-indicator';
import localUpload from 'edpub-data-upload-utility';
import { listFileUploadsBySubmission, listFileDownloadsByKey } from '../../actions';

class UploadOverview extends React.Component {
  constructor() {
    super();
    this.state = { loaded: false, hiddenFileInput: React.createRef(null), statusMsg: 'Select a file', uploadFile: '', keys: [], saved: [] };
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getFileList = this.getFileList.bind(this);
    this.validateFile = this.validateFile.bind(this);
    this.resetInputWithTimeout = this.resetInputWithTimeout.bind(this);
    this.keyLookup = this.keyLookup.bind(this);
  }

  keyLookup(event, fileName) {
    event.preventDefault();
    if (this.state.keys[fileName]) {
      const { dispatch } = this.props;
      const { requestId } = this.props.match.params;
      if (requestId !== '' && requestId != undefined && requestId !== null) {
        dispatch(listFileDownloadsByKey(this.state.keys[fileName], requestId))
          .then((resp) => {
            console.log('resp', resp)
            /* {
              "id": "379caaef-45fc-452b-8ce1-4c3c498e7062",
              "type": "UPLOAD",
              "data": "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><link rel=\"icon\" href=\"/favicon.svg\"><title>Earthdata Pub</title><script defer=\"defer\" src=\"/js/chunk-vendors.0992f19f.js\"></script><script defer=\"defer\" src=\"/js/app.d8addf74.js\"></script><link href=\"/css/chunk-vendors.3a1d7678.css\" rel=\"stylesheet\"><link href=\"/css/app.52b3d106.css\" rel=\"stylesheet\"></head><body><noscript><strong>We're sorry but earthdata-pub-overview doesn't work properly without JavaScript enabled. Please enable it to continue.</strong></noscript><div id=\"app\" role=\"main\"></div><script src=\"https://fbm.earthdata.nasa.gov/for/EDPub/feedback.js\"></script><script>feedback.init();</script><script src=\"https://cdn.earthdata.nasa.gov/tophat2/tophat2.js\" id=\"earthdata-tophat-script\" data-show-fbm=\"true\" data-show-status=\"true\" data-width=\"1450\"></script></body></html>",
              "config": {
                "json": true,
                "resolveWithFullResponse": true,
                "simple": false,
                "type": "UPLOAD",
                "method": "GET",
                "id": "379caaef-45fc-452b-8ce1-4c3c498e7062",
                "path": "data/upload/downloadUrl/15df4fda-ed0d-417f-9124-558fb5e5b561/379caaef-45fc-452b-8ce1-4c3c498e7062/c259a741-1822-48a9-b6c3-9a4ecaac0338/localhost.crt",
                "headers": {
                  "Content-Type": "application/json",
                  "Authorization": "Bearer eyJraWQiOiJmdjYyVTVidkVEYXJYaEZxbk9ZQ3dHNFB5akdUMHhSTjhIMTNGb010Y2lNPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjMjU5YTc0MS0xODIyLTQ4YTktYjZjMy05YTRlY2FhYzAzMzgiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtd2VzdC0yLmFtYXpvbmF3cy5jb21cL3VzLXdlc3QtMl9hWTVpOW5WeTYiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiI2cXIwb3JpYTFhZ3Zobmk3amYyY3JoZ2lscSIsImV2ZW50X2lkIjoiYjc2MDVjMTUtMzE0Yi00ZmY2LWI5ZDktZmQwNzAyNGEyMGM4IiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJvcGVuaWQiLCJhdXRoX3RpbWUiOjE2OTE1MDk0NjAsImV4cCI6MTY5MTUxMzA2MCwiaWF0IjoxNjkxNTA5NDYwLCJqdGkiOiJiM2E2MGViYS02ODIyLTQ5NmUtODA5Yi0zZmI3OTQ0MmI0NDEiLCJ1c2VybmFtZSI6IjVrYiJ9.fBSX7Pphv1PO9WO2P60MyhBQCGUQidyXW_ji2AFkm14j84D07909B1ovDur-MIqoUkXfEU_intbBLgaPxPoeCuWbL9pr132GBDenoGqQNzSXkOVgJH_it38brbO58tQghHmCfegV-RzefbLpWtHqy3ItOuRtrfREPhOuMvitaAzfQq8EwiVCS6TTZmPI3Dj4nD8PxE5ejnLc09fnHZsNOQ3huiUiBuBTw1bj2y_X9i7373aubyRJyzyiZbaZRF3bfnELu96zyYgOcJLMvKiDXuYkNpKfC8KvzgDMUabisthsamhwbgQaidQbBWMZFM1D21eDwaiN5FjO3RpfrgKkyQ"
                },
                "url": "https://pub.sit.earthdata.nasa.gov/api/data/upload/downloadUrl/15df4fda-ed0d-417f-9124-558fb5e5b561/379caaef-45fc-452b-8ce1-4c3c498e7062/c259a741-1822-48a9-b6c3-9a4ecaac0338/localhost.crt"
              }
            } */
            const download = new localUpload();
            const { apiRoot } = _config;
            const payload = (this.state.keys[fileName], `${apiRoot}data/upload/downloadUrl/${this.state.keys[fileName]}`, loadToken().token)
            console.log('key is ' + this.state.keys[fileName] + ', apiEndpointn is ' + `${apiRoot}data/upload/downloadUrl/${this.state.keys[fileName]}` + ', token is ' + loadToken().token)
            download.downloadFile(payload).then((resp) => {
              if (resp.error) {
                console.log(`An error has occured: ${resp.error}. Trying something else`);
                download.downloadFile(this.state.keys[fileName], `${apiRoot}data/upload/downloadUrl/${this.state.keys[fileName]}`, loadToken().token).then((resp) => {
                  if (resp.error) {
                    console.log(`2 An error has occured: ${resp.error}. Trying something else`);

                  } else {
                    console.log('2 no errors', resp)
                  }
                })
              } else {
                console.log('no errors', resp)
              }
            })
          }
        );
      }
    }
  }

  getFileList() {
    const { dispatch } = this.props;
    const { requestId } = this.props.match.params;
    if (requestId !== '' && requestId != undefined && requestId !== null) {
      dispatch(listFileUploadsBySubmission(requestId))
        .then((resp) => {
          let html = []
          /*
            DO NOT REMOVE - THIS IS USEFUL FOR WHEN TESTING LOCALLY
          */
          /* const bucket = '15df4fda-ed0d-417f-9124-558fb5e5b561';
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
          }; */
          if (resp.data.error) {
            const str = `An error has occurred while getting the list of files: ${resp.data.error}.`;
            console.log(str)
          } else {
            document.getElementById('previously-saved').replaceChildren();
            const dataArr = resp.data;
            dataArr.sort(function (a, b) {
              var keyA = new Date(a.last_modified),
                keyB = new Date(b.last_modified);
              if (keyA > keyB) return -1;
              if (keyA < keyB) return 1;
              return 0;
            });
            this.setState({ keys: [] });
            let tmpKeys = []
            for (const ea in dataArr) {
              const fileName = dataArr[ea].file_name;
              if (dataArr[ea]=== undefined || fileName === undefined){
                break
              }
              const key = dataArr[ea].key;
              tmpKeys[`${fileName}`] = key
              if (document.getElementById('previously-saved') !== null) {
                html.push(<><a id={fileName} name={fileName} aria-label={`Download ${fileName}`} onClick={(e) => this.keyLookup(e, fileName)}>{fileName}</a><br /></>)
              }
            }
            html.map(item =>
              <span key={item}>{item}</span>
            )
            this.setState({ saved: html });
            this.setState({ keys: tmpKeys });
          }
        });
    }
  }

  componentDidMount() {
    this.getFileList()
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
            <span id='previously-saved'>
              {this.state.saved ? this.state.saved : null}
            </span>
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