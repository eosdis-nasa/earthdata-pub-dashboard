'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import _config from '../../config';
import { loadToken } from '../../utils/auth';
import Loading from '../LoadingIndicator/loading-indicator';
import localUpload from '@edpub/upload-utility';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { listFileUploadsBySubmission, listFileDownloadsByKey, refreshToken } from '../../actions';
import { shortDateShortTimeYearFirstJustValue, storage } from '../../utils/format';
import Table from '../SortableTable/SortableTable';
import { Modal, Button } from 'react-bootstrap';

// Request Details Overview Page i.e. /dashboard/requests/id/{id}

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
      progressValue: 0, // Initialize progressValue,
      uploadFailed: false,
      uploadFileName: '',
      error: '',
      file: null,
      categoryType: null,
      uploadFiles: [],
      uploadStatusMsg: '',
      uploadFileFlag: false,
      showUploadSummaryModal: false,
      uploadResults: {},
      uploadProgress: {},
      progressBarsVisible: true
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getFileList = this.getFileList.bind(this);
    this.validateFile = this.validateFile.bind(this);
    this.keyLookup = this.keyLookup.bind(this);
    this.resetInputWithTimeout = this.resetInputWithTimeout.bind(this);
    this.handleCloseUploadSummaryModal = this.handleCloseUploadSummaryModal.bind(this);
    this.toggleProgressBars = this.toggleProgressBars.bind(this);
    this.handleFileDrop = this.handleFileDrop.bind(this);
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
    this.resetInputWithTimeout(undefined, 0);
    this.handleUpload();
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

  resetRadioState() {
    this.setCategoryType(undefined);
  }

  async handleUpload() {
    this.setState({
      uploadStatusMsg: 'Uploading...'
    });
  
    const successFiles = [];
    const failedFiles = [];
    const { requestId } = this.props.match.params;
    const { groupId } = this.props.match.params;
    const { apiRoot } = _config;
    const category = this.state.categoryType;
  
    const uploadFileAsync = (file) => {
      return new Promise((resolve, reject) => {
        // Update progress function
        const updateProgress = (progress, fileObj) => {
          this.setState((prevState) => ({
            uploadProgress: {
              ...prevState.uploadProgress,
              [fileObj.name]: Math.min(progress, 100),
            }
          }));
        };
  
        let payload = {
          fileObj: file,
          authToken: loadToken().token,
        };
  
        if (requestId) {
          payload['apiEndpoint'] = `${apiRoot}data/upload/getPostUrl`;
          payload['submissionId'] = requestId;
          payload['endpointParams'] = { file_category: category };
        } else if (groupId) {
          const prefixElement = document.getElementById('prefix');
          const prefix = prefixElement ? prefixElement.value : '';
          payload['apiEndpoint'] = `${apiRoot}data/upload/getGroupUploadUrl`;
          payload['endpointParams'] = {
            prefix: prefix,
            group_id: groupId
          };
        }
  
        const upload = new localUpload();
        upload.uploadFile(payload, updateProgress)
          .then((resp) => {
            const error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error;
            if (error) {
              console.error(`Error uploading file ${file.name}: ${error}`);
              this.setState((prevState) => ({
                uploadProgress: {
                  ...prevState.uploadProgress,
                  [file.name]: 'Failed',
                }
              }));
              reject(file.name);
            } else {
              resolve(file.name);
            }
          })
          .catch((err) => {
            console.error(`Error uploading file ${file.name}: ${err}`);
            reject(file.name);
          });
      });
    };
  
    const uploadPromises = this.state.uploadFiles.map((file) => {
      if (this.validateFile(file)) {
        return uploadFileAsync(file)
          .then((fileName) => successFiles.push(fileName))
          .catch((fileName) => failedFiles.push(fileName));
      } else {
        failedFiles.push(file.name);
        return Promise.resolve();
      }
    });
  
    await Promise.all(uploadPromises);
  
    this.setState({
      uploadStatusMsg: '',
      uploadFileFlag: true,
      showUploadSummaryModal: true,
      uploadFiles: [],
      uploadResults: { success: successFiles, failed: failedFiles },
      uploadProgress: {}
    });
    this.getFileList()
  }
  
  handleCloseUploadSummaryModal() {
    this.setState({ showUploadSummaryModal: false });
  }

  toggleProgressBars = () => {
    this.setState({ progressBarsVisible: !this.state.progressBarsVisible });
  };

  handleRemoveFile = (fileName) => {
    this.setState({uploadFiles: this.state.uploadFiles.filter(elem => elem.name !== fileName)});
  };

  async componentDidUpdate(prevProps){
    if (prevProps.tokens.inflight !== this.props.tokens.inflight) {
      if (!this.props.tokens.inflight) {
        await this.handleUpload()
      }
    }
  }

  async handleFileDrop(e) {
      e.preventDefault();
      e.stopPropagation();

      var files = e.dataTransfer.files;
      if (files.length) {
        this.setState((prevState) => ({
          uploadFiles: prevState.uploadFiles.concat(Array.from(files)) 
      }));
      }
  }

  handleDragOver(e) {
      e.preventDefault();
      e.stopPropagation();
  }

  handleDragEnter(e) {
      e.preventDefault();
      e.stopPropagation();
  }

  handleDragLeave(e) {
      e.preventDefault();
      e.stopPropagation();
  }

  async handleChange(e) {
    e.preventDefault();
    this.setState((prevState) => ({
      uploadFiles: prevState.uploadFiles.concat(Array.from(e.target.files)) 
  }));
  }
  
  async setCategoryType(e) {
    this.setState({categoryType: e});
  }
  

  render() {
    const { showUploadSummaryModal, uploadResults, uploadProgress, progressBarsVisible } = this.state;
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
              {this.state.progressValue > 0 &&
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
                    <input type="radio" id="documentation_category" onChange={() => this.setCategoryType("documentation")} checked={this.state.categoryType === 'documentation'}/>
                    <label style={{ marginLeft: '5px', marginBottom: '0px', fontSize: '1em' }} htmlFor="documentation_category">Documentation</label>
                  </label>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginRight: '15px',
                    }}
                  >
                    <input type="radio" id="sample_category" onChange={() => this.setCategoryType("sample")} checked={this.state.categoryType === 'sample'}/>
                    <label style={{ marginLeft: '5px', marginBottom: '0px', fontSize: '1em' }} htmlFor="sample_category">Sample Files</label>
                  </label>
                </div>
                <br />
                </>: null
              }
              </div>
                <div 
                  className="mt-3 questions-component"
                  onDragOver={this.handleDragOver}
                  onDragEnter={this.handleDragEnter}
                  onDragLeave={this.handleDragLeave}
                  onDrop={this.handleFileDrop}
                  onClick={() =>
                    document.getElementById('file-upload-input').click()
                  }
                >
                <div className="upload-container">
                  <p>Drag & drop files here, or click to select files</p>
                  <input 
                    type="file" 
                    id="file-upload-input" 
                    className="upload-input" 
                    onChange={(e) => this.handleChange(e)} 
                    multiple 
                  />
                  {this.state.uploadFiles.length > 0 && (
                    <p>
                      <strong>{this.state.uploadFiles.length} file(s) selected. Click on upload</strong>
                    </p>
                  )}                                            
                </div>
              </div>
              <button onClick={(e) => this.handleClick(e)} className={`upload-button upload-button-category mt-2 button button__animation--md button__arrow button__arrow--md button__animation button__arrow--white ${(this.state.categoryType || groupId) && this.state.uploadFiles.length !== 0? 'button--submit' : 'button--secondary button--disabled'}`}>{this.state.uploadStatusMsg === ''? 'Upload': 'Uploading...'}</button>
              {<span className="d-flex align-items-center">
                <FontAwesomeIcon
                  icon={progressBarsVisible ? faEyeSlash : faEye}
                  style={{ cursor: 'pointer', marginLeft: '10px', fontSize: '20px' }}
                  className="ml-2"
                  onClick={this.toggleProgressBars}
                  title={progressBarsVisible ? 'Hide Upload Progress' : 'Show Upload Progress'}
                />
              </span>}

              {progressBarsVisible && this.state.uploadFiles.length > 0 && (
                <div>
                  {this.state.uploadFiles.map((file, index) => (
                    <div key={index}>
                      <div style={{display: "flow-root"}}>
                        {file.name}
                        <Button
                          style={{
                            fontSize: "100%",
                            padding: "5px",
                            backgroundColor: "#db1400",
                            margin: "2px",
                            float: "inline-end",
                            border: "none",
                            borderRadius: "4px",
                            color: "white",
                          }}
                          onClick={() => this.handleRemoveFile(file.name)}
                          >Remove</Button>
                      </div>
                      <div style={{ width: '100%', backgroundColor: uploadProgress[file.name] !== 'Failed'?'#f1f1f1':'red', height: '30px', marginBottom: '5px' }}>
                        <div style={{
                          width: `${uploadProgress[file.name] || 0}%`,
                          backgroundColor: '#2275aa',
                          height: '100%',
                          textAlign: 'center',
                          lineHeight: '30px',
                          color: 'white',
                        }}>
                          {uploadProgress[file.name] && uploadProgress[file.name] !== 'Failed'? `${uploadProgress[file.name]}%` : '0%'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
          <Modal show={showUploadSummaryModal} onHide={this.handleCloseUploadSummaryModal} className="custom-modal">
          <Modal.Header closeButton>
            <Modal.Title>Upload Summary</Modal.Title>
          </Modal.Header>
          
          <Modal.Body>
            <h5>Successful Uploads</h5>
            {uploadResults.success && uploadResults.success.length > 0 ? (
              <ul aria-live="polite">
                {uploadResults.success.map((fileName, index) => (
                  <li key={index}>{fileName}</li>
                ))}
              </ul>
            ) : (
              <p>No files were uploaded successfully.</p>
            )}

            <h5>Failed Uploads</h5>
            {uploadResults.failed && uploadResults.failed.length > 0 ? (
              <ul aria-live="polite">
                {uploadResults.failed.map((fileName, index) => (
                  <li key={index}>{fileName}</li>
                ))}
              </ul>
            ) : (
              <p>No files failed to upload.</p>
            )}
          </Modal.Body>
          
          <Modal.Footer>
            <Button variant="primary" onClick={this.handleCloseUploadSummaryModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
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
