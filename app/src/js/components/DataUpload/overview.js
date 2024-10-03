'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import _config from '../../config';
import { loadToken } from '../../utils/auth';
import Loading from '../LoadingIndicator/loading-indicator';
import localUpload from '@edpub/upload-utility';
import { listFileUploadsBySubmission, listFileDownloadsByKey, refreshToken } from '../../actions';
import { shortDateShortTimeYearFirstJustValue, storage } from '../../utils/format';
import Table from '../SortableTable/SortableTable';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class UploadOverview extends React.Component {
  constructor() {
    super();
    this.state = { 
      loaded: false, 
      hiddenFileInput: React.createRef(null), 
      statusMsg: 'Select a file', 
      uploadFile: '', 
      keys: [],
      showProgressBar: false, // Added state to control the visibility of the progress bar,
      progressValue: 0, // Initialize progressValue,
      uploadFailed: false,
      uploadFileName: '',
      error: '',
      file: null,
      categoryType: null
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getFileList = this.getFileList.bind(this);
    this.validateFile = this.validateFile.bind(this);
    this.keyLookup = this.keyLookup.bind(this);
    this.resetInputWithTimeout = this.resetInputWithTimeout.bind(this);
  }
  
  keyLookup(e, fileName) {
    e.preventDefault();
    if (this.state.keys[fileName]) {
      const { dispatch } = this.props;
      const { requestId } = this.props.match.params;
      if (requestId !== '' && requestId != undefined && requestId !== null) {
        const download = new localUpload();
        const { apiRoot } = _config;
        dispatch(listFileDownloadsByKey(this.state.keys[fileName], requestId))
          .then(() => {
            download.downloadFile(this.state.keys[fileName], `${apiRoot}data/upload/downloadUrl`, loadToken().token).then((resp) => {
              let error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error
              if (error) {
                console.log(`An error has occurred: ${error}.`);
              }
            })
          }
        );
      }
    }
  };
  
  async getFileList() {
    const { dispatch } = this.props;
    const { requestId } = this.props.match.params;
    if (requestId !== '' && requestId != undefined && requestId !== null) {
      dispatch(listFileUploadsBySubmission(requestId))
        .then((resp) => {
          if (JSON.stringify(resp) === '{}' || JSON.stringify(resp) === '[]' || (resp.data && resp.data.length === 0)) {
            return
          }
          let error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error
          if (error){
            if (!error.match(/not authorized/gi) && !error.match(/not implemented/gi)) {
              const str = `An error has occurred while getting the list of files: ${error}.`;
              console.log(str)
              return
            } else {
              return
            }
          }

          const files = resp.data;
          
          files.sort(function (a, b) {
            var keyA = new Date(a.last_modified),
              keyB = new Date(b.last_modified);
            if (keyA > keyB) return -1;
            if (keyA < keyB) return 1;
            return 0;
          });

          this.setState({ files: files })
          
          const keyDict = {};
          const html = [];

          for (const ea in files) {
            const fileName = files[ea].file_name;
            if (files[ea] === undefined || fileName === undefined) {
              break
            }
            const key = files[ea].key;
            keyDict[`${fileName}`] = key
          }
          this.setState({ files: files })

          html.map(item =>
            <span key={item}>{item}</span>  
          )

          this.setState({ keys: keyDict })
          this.setState({ saved: html })
        });
    }
  }

  async componentDidMount() {
    const { groupId } = this.props.match.params;
    const { requestId } = this.props.match.params;
    if ((requestId !== '' && requestId != undefined && requestId !== null) &&
      (groupId == '' || groupId === undefined || groupId === null)) {
      await this.getFileList()
      this.setState({ loaded: true })
    }
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

  async uploadFile(){
    const file = this.state.file
    if (this.validateFile(file)) {
      this.setState({ statusMsg: 'Uploading', showProgressBar: true, progressValue: 0, uploadFileName: file ? file.name: '' });

      // Define the callback function to update progress value in state
      const updateProgress = (progress, fileObj) => {
        this.setState({ progressValue: Math.min(progress, 100), uploadFileName: fileObj ? fileObj.name: '' });
      };

      const upload = new localUpload();
      const { requestId } = this.props.match.params;
      const { groupId } = this.props.match.params;
      const { apiRoot } = _config;

      let category = document.querySelector('input[name="category"]:checked')?.value;
      try {
        let payload = {
          fileObj: file,
          authToken: loadToken().token
        }
        let prefix = ''
        if (requestId !== '' && requestId != undefined && requestId !== null) {
          payload['apiEndpoint'] = `${apiRoot}data/upload/getPostUrl`;
          payload['submissionId'] = requestId
          payload['endpointParams'] = { file_category: category };
        } else if (groupId !== '' && groupId != undefined && groupId !== null) {
          if (document.getElementById('prefix') && document.getElementById('prefix') !== null) {
            prefix = document.getElementById('prefix').value
          }
          payload['apiEndpoint'] = `${apiRoot}data/upload/getGroupUploadUrl`;
          payload['endpointParams'] = {
            prefix: prefix,
            group_id: groupId
          }
        }
        this.setState({ statusMsg: 'Uploading', uploadFailed: false });
        const resp = await upload.uploadFile(payload, updateProgress);

        let error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error
        if (error) {
          console.log(`An error has occurred on uploadFile: ${error}.`);
          this.resetInputWithTimeout('Select a file', 1000)
          this.setState({ uploadFailed: true, error: error});
          if (typeof category !== 'undefined') {
            document.querySelector('input[name="category"]:checked').checked = false;
            this.setCategoryType(undefined);
          }
        } else {
          this.setState({ statusMsg: 'Upload Complete', progressValue: 0, uploadFileName: '' });
          this.resetInputWithTimeout('Select a file', 1000)
          if ((requestId !== '' && requestId != undefined && requestId !== null) &&
            (groupId == '' || groupId === undefined || groupId === null)) {
            this.getFileList()
          }
          if (typeof category !== 'undefined') {
            document.querySelector('input[name="category"]:checked').checked = false;
            this.setCategoryType(undefined);
          }
        }
      } catch (error) {
        this.setState({ uploadFailed: true });
        console.log(`try catch error: ${error.stack}`);
        this.resetInputWithTimeout('Select a file', 1000)
        if (typeof category !== 'undefined') {
          document.querySelector('input[name="category"]:checked').checked = false;
          this.setCategoryType(undefined);
        }
      }
    }
  }

  async componentDidUpdate(prevProps){
    if (prevProps.tokens.inflight !== this.props.tokens.inflight) {
      if (!this.props.tokens.inflight) {
        await this.uploadFile()
      }
    }
  }

  async handleChange(e) {
    const { dispatch } = this.props;
    e.preventDefault();
    this.setState({file: e.target.files[0]})
    dispatch(refreshToken());
  }

  async setCategoryType(e) {
    this.setState({categoryType: e});
  }
  

  render() {
    const progressBarStyle = {
      width: '100%',
      backgroundColor: this.state.uploadFailed ? '#db1400' : 'white',
      height: '30px' // Set the height of the progress bar
    };

    const progressBarFillStyle = {
      height: '100%',
      backgroundColor: this.state.uploadFailed ? '#db1400' : '#2275aa', // Set default fill color to blue
      textAlign: 'center',
      lineHeight: '30px', 
      color: 'white', 
      fontSize: '20px', 
      width: this.state.uploadFailed ? '100%' : `${this.state.progressValue}%` // Set width based on progress value
    };
  
    const numberDisplayStyle = {
      fontSize: '20px' 
    };

    const tableColumns = [
      {
        Header: 'Filename',
        accessor: row => <><a id={row.file_name} name={row.file_name} aria-label={`Download ${row.file_name}`} onClick={(e) => this.keyLookup(e, row.file_name)}> {row.file_name}</a></>,
        id: 'file_name'
      },
      {
        Header: 'Size',
        accessor: row => storage(row.size),
        id: 'size',
        width: '100px'
      },
      {
        Header: 'Category',
        accessor: row => row.category.charAt(0).toUpperCase() + row.category.substring(1).toLowerCase(),
        id: 'category',
      },
      {
        Header: 'sha256Checksum',
        accessor: row => row.sha256Checksum,
        id: 'sha256Checksum'
      },
      {
        Header: 'Last Modified',
        accessor: row => shortDateShortTimeYearFirstJustValue(row.lastModified),
        id: 'lastModified'
      }
    ];
    const { requestId } = this.props.match.params;
    const { groupId } = this.props.match.params;
    return (
      <>
        <br></br>
        <div className='page__component'>
          <div className='page__section__header'>
            <h1 className='heading--small' aria-labelledby='Upload Data File'>
              Sample Data and Data Product Documentation File(s): Add or replace file(s).
            </h1>
            <p>Providing sample data files that are representative of the range of data within this data product will help the DAAC understand and provide feedback on the data format, structure, and content. Documentation files may include descriptions of the variables, filename conventions, processing steps, and/or data quality.  If more than 10 total sample data and documentation files are necessary to represent and describe the data product, please contact the DAAC for assistance.  Files must be less than 5 GB and cannot include .exe or .dll extensions.</p>
          </div>
          <div className='indented__details' style={{ paddingTop: '1rem' }}>
            <div className='form__textarea'>
              {groupId !== undefined ?
                <>
                  <label htmlFor="prefix" style={{ marginBottom: '1rem', marginTop: '1rem', fontSize: 'unset' }}>Subfolder (If applicable): </label>
                  <input id="prefix" name="prefix" style={{ marginBottom: '1rem' }} />
                </>
                : null
              }
              {this.state.showProgressBar && this.state.progressValue > 0 && 
                <div style={progressBarStyle}>
                  <div style={progressBarFillStyle}>
                    <span style={numberDisplayStyle}>{this.state.uploadFailed ? <span>{'Upload Failed'}<span className="info-icon" data-tooltip={this.state.error}></span></span>: `${this.state.progressValue}%`}</span>
                  </div>
                </div>}
              <div>
              {requestId !== undefined ?
                <>
                <p style={{fontWeight: '600'}}>Select File Category:</p>
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginRight: '15px',
                  }}>
                    <input type="radio" id="documentation_category" name="category" value="documentation" onClick={() => this.setCategoryType("documentation")}/>
                    <label className="diff" style={{ marginLeft: '5px', marginBottom: '0px', fontSize: '1em' }} htmlFor="documentation">Documentation</label>
                  </label>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginRight: '15px',
                    }}
                  >
                    <input type="radio" id="sample_category" name="category" value="sample" onClick={() => this.setCategoryType("sample")}/>
                    <label className="diff" style={{ marginLeft: '5px', marginBottom: '0px', fontSize: '1em' }} htmlFor="sample">Sample Files</label>
                  </label>
                </div>
                <br />
                </>: null
              }
              </div>
              <label htmlFor='hiddenFileInput' style={{ marginBottom: '1rem', fontSize: 'unset' }}>{`${this.state.statusMsg}`}
                <input
                  onChange={(e) => this.handleChange(e)}
                  type="file"
                  multiple={false}
                  style={{ display: 'none' }}
                  ref={this.state.hiddenFileInput}
                  id="hiddenFileInput" />
              </label>
              <button onClick={(e) => this.handleClick(e)} className={`button button__animation--md button__arrow button__arrow--md button__animation button__arrow--white ${this.state.categoryType ? 'button--submit' : 'button--secondary button--disabled'}`}>Upload File</button>
            </div>
            {this.state.saved && requestId !== undefined && groupId === undefined
              ?
              <>
                <br />
                <section className='page__section'>
                  <div style={{ borderBottom: '1px solid #E2DFDF' }}>
                    <h2 className='heading--medium heading--shared-content with-description'>Files Previously Uploaded</h2>
                  </div>
                  <Table
                    data={this.state.files}
                    dispatch={this.props.dispatch}
                    tableColumns={tableColumns}
                  />
                </section>
              </>
              : null}
            {!this.state.loaded && groupId === undefined ? <Loading /> : null}
            <span>{this.state.saved ? this.state.saved : null}</span>
          </div>
        </div>
      </>
    );
  }
}

UploadOverview.propTypes = {
  stats: PropTypes.object,
  dispatch: PropTypes.func,
  config: PropTypes.object,
  logs: PropTypes.object,
  tokens: PropTypes.object
};

export default withRouter(connect(state => ({
  stats: state.stats,
  config: state.config,
  logs: state.logs,
  tokens: state.api.tokens
}))(UploadOverview));
