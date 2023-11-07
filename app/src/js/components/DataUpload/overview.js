'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import _config from '../../config';
import { loadToken } from '../../utils/auth';
import Loading from '../LoadingIndicator/loading-indicator';
import localUpload from 'edpub-data-upload-utility';
import { listFileUploadsBySubmission, listFileDownloadsByKey } from '../../actions';
import { shortDateShortTimeYearFirstJustValue, storage } from '../../utils/format';
import Table from '../SortableTable/SortableTable';

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

  async handleChange(e) {
    e.preventDefault();
    const file = e.target.files[0];
    if (this.validateFile(file)) {
      this.setState({ statusMsg: 'Uploading' });
      const upload = new localUpload();
      const { requestId } = this.props.match.params;
      const { groupId } = this.props.match.params;
      const { apiRoot } = _config;
      try {
        let payload = {
          fileObj: file,
          authToken: loadToken().token,
        }
        let prefix = ''
        if (requestId !== '' && requestId != undefined && requestId !== null) {
          payload['apiEndpoint'] = `${apiRoot}data/upload/getPostUrl`;
          payload['submissionId'] = requestId
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
        this.setState({ statusMsg: 'Uploading' });
        const resp = await upload.uploadFile(payload)
        let error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error
        if (error) {
          console.log(`An error has occured on uploadFile: ${error}.`);
          this.resetInputWithTimeout('Select a file', 1000)
        } else {
          this.setState({ statusMsg: 'Upload Complete' });
          this.resetInputWithTimeout('Select another file', 1000)
          if ((requestId !== '' && requestId != undefined && requestId !== null) &&
            (groupId == '' || groupId === undefined || groupId === null)) {
            this.getFileList()
          }
        }
      } catch (error) {
        console.log(`try catch error: ${error.stack}`);
        this.resetInputWithTimeout('Select a file', 1000)
      }
    }
  };

  render() {
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
        Header: 'sha256Checksum',
        accessor: row => row.sha256Checksum,
        id: 'sha256Checksum'
      },
      {
        Header: 'Last Modified',
        accessor: row => shortDateShortTimeYearFirstJustValue(row.last_modified),
        id: 'last_modified'
      }
    ];
    const { requestId } = this.props.match.params;
    const { groupId } = this.props.match.params;
    return (
      <><br></br>
        <div className='page__component'>
          <div className='page__section__header'>
            <h1 className='heading--small' aria-labelledby='Upload Data File'>
              Upload Data File
            </h1>
          </div>
          <div className='indented__details' style={{ paddingTop: '1rem' }}>
            <div className='form__textarea'>
              {groupId !== undefined ?
                <><label htmlFor="prefix" style={{ marginBottom: '1rem', marginTop: '1rem', fontSize: 'unset' }}>Subfolder (If applicable): </label><input id="prefix" name="prefix" style={{ marginBottom: '1rem' }} /></>
              : null
              }
              {this.state.statusMsg === 'Uploading' ? <Loading /> : null}
              <label htmlFor='hiddenFileInput' style={{ marginBottom: '1rem', fontSize: 'unset' }}>{`${this.state.statusMsg}`}
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
            {this.state.saved && requestId !== undefined && groupId === undefined
            ?
              <><br /><section className = 'page__section'>
                <div style={{ borderBottom: '1px solid #E2DFDF'}}>
                <h2 className='heading--medium heading--shared-content with-description'>Files Previously Uploaded</h2>
                </div>
                <Table
                  data={this.state.files}
                  dispatch={this.props.dispatch}
                  tableColumns={tableColumns}
                />
              </section></>
              : null }
            {!this.state.loaded && groupId === undefined ? <Loading /> : null}
            <span>{this.state.saved ? this.state.saved : null}</span>
          </div>
        </div></>
    );
  }
}

UploadOverview.propTypes = {
  stats: PropTypes.object,
  dispatch: PropTypes.func,
  config: PropTypes.object,
  logs: PropTypes.object,
};

export default withRouter(connect(state => ({
  stats: state.stats,
  config: state.config,
  logs: state.logs
}))(UploadOverview));
