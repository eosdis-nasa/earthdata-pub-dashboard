'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import _config from '../../config';
import { loadToken } from '../../utils/auth';
import Loading from '../LoadingIndicator/loading-indicator';
import localUpload from 'edpub-data-upload-utility';
import { listFileUploadsBySubmission, listFileDownloadsByKey, refreshToken } from '../../actions';

class UploadOverview extends React.Component {
  constructor() {
    super();
    this.state = { 
      loaded: false, 
      hiddenFileInput: React.createRef(null), 
      statusMsg: 'Select a file', 
      uploadFile: '', 
      keys: []
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getFileList = this.getFileList.bind(this);
    this.validateFile = this.validateFile.bind(this);
    this.resetInputWithTimeout = this.resetInputWithTimeout.bind(this);
    this.keyLookup = this.keyLookup.bind(this);
    this.isFilePreviouslySaved = this.isFilePreviouslySaved.bind(this);

  }

  keyLookup(event, fileName) {
    event.preventDefault();
    if (this.state.keys[fileName]) {
      const { dispatch } = this.props;
      const { requestId } = this.props.match.params;
      if (requestId !== '' && requestId != undefined && requestId !== null) {
        const download = new localUpload();
        const { apiRoot } = _config;
        dispatch(listFileDownloadsByKey(this.state.keys[fileName], requestId))
          .then(() => {
            download.downloadFile(this.state.keys[fileName], `${apiRoot}data/upload/downloadUrl`, loadToken().token).then((resp) => {
              if (resp.error) {
                console.log(`An error has occurred: ${resp.error}.`);
              }
            })
          }
          );
      }
    }
  }

  async getFileList() {
    const { dispatch } = this.props;
    const { requestId } = this.props.match.params;
    if (requestId) {
      dispatch(listFileUploadsBySubmission(requestId))
        .then((resp) => {
          if (resp?.data.error){
            if (!resp.data.error.match(/not authorized/gi) && !resp.data.error.match(/not implemented/gi)) {
              const str = `An error has occurred while getting the list of files: ${resp.data.error}.`;
              this.setState({ saved: str })
            } else {
              this.setState({ saved: 'None found' })
            }
          } else if(!resp.data===[]){
            this.setState({ saved: 'None found' })
          }

          const files = resp.data;
          console.log(files);
          if (files.length === 0) {
            this.setState({ saved: 'None found' })
            return
          }
          
          this.setState({ files: files })
          
          const keyDict = {}
          const html = []
          files.forEach((file) => {
            keyDict[file.file_name] = file.key
            html.push(<><a id={file.file_name} name={file.file_name} aria-label={`Download ${file.file_name}`} onClick={(e) => this.keyLookup(e, file.file_name)}>{file.file_name}</a><br /></>)
          })

          html.map(item =>
            <span key={item}>{item}</span>  
          )

          this.setState({ keys: keyDict })
          this.setState({ saved: html })
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

  resetInputWithTimeout(msg, timeout) {
    setTimeout(() => {
      msg ? this.setState({ statusMsg: msg }) : null
      if (this.state.hiddenFileInput.current === null || this.state.hiddenFileInput === null) {
        this.setState({ hiddenFileInput: React.createRef(null) });
      }
    }, timeout);
  }

  isFilePreviouslySaved(file) {
    let alreadySaved = false;
    if (this.state.saved) {
      for (const ea in this.state.saved) {
        let reactElement = this.state.saved[ea]
        for (const prop in reactElement) {
          if (typeof reactElement[prop] === 'object' &&
            reactElement[prop] !== null &&
            reactElement[prop]['children'] !== null &&
            reactElement[prop]['children'] !== undefined &&
            reactElement[prop]['children'].length > 0) {
            for (const child in reactElement[prop]['children']) {
              if (reactElement[prop]['children'][child]['props']['id'] !== undefined && reactElement[prop]['children'][child]['props']['id'] === file.name) {
                alreadySaved = true;
              }
            }
          }
        }
      }
    }
    return alreadySaved
  }

  validateFile(file) {
    let valid = false;
    if (file.name.match(/\.([^\.]+)$/) !== null) {
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
    const { dispatch } = this.props;
    e.preventDefault();
    const file = e.target.files[0];
    if (this.validateFile(file)) {
      this.setState({ statusMsg: 'Uploading' });
      const upload = new localUpload();
      const { requestId } = this.props.match.params;
      const { apiRoot } = _config;
      dispatch(refreshToken()).then((resp) => {console.log(resp)});
      if (requestId !== '' && requestId != undefined && requestId !== null) {
        const payload = {
          fileObj: file,
          apiEndpoint: `${apiRoot}data/upload/getPostUrl`,
          authToken: loadToken().token,
          submissionId: requestId
        }
        const resp = await upload.uploadFile(payload)
        this.setState({ statusMsg: 'Uploading' });
        if (resp.error) {
          console.log(`An error has occured: ${resp.error}.`);
          this.resetInputWithTimeout('Select a file', 1000)
        } else {
          this.setState({ statusMsg: 'Upload Complete' });
          this.getFileList();
          this.resetInputWithTimeout('Select another file', 1000)
        }
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
            <div className='form__textarea'>
              {this.state.statusMsg === 'Uploading' ? <Loading /> : null}
              <label className='heading--medium' htmlFor='hiddenFileInput' style={{ marginBottom: '1rem' }}>{`${this.state.statusMsg}`}
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
            <br></br><h1 className='heading--small' aria-labelledby='Files Previously Saved'>
              Files Previously Uploaded:
            </h1>
            {!this.state.saved ? <Loading /> : null}
            <span id='previously-saved'>
              {this.state.saved ? this.state.saved : null}
            </span>
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