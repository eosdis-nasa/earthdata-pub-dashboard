'use strict';
import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import _config from '../../config';
import { loadToken } from '../../utils/auth';
import Loading from '../LoadingIndicator/loading-indicator';
import localUpload from 'edpub-data-upload-utility';
import { listFileUploadsBySubmission, listFileDownloadsByKey, 
  // refreshToken 
} from '../../actions';

class UploadOverview extends React.Component {
  constructor() {
    super();
    this.state = { loaded: false, hiddenFileInput: React.createRef(null), statusMsg: 'Select a file', uploadFile: '', keys: [] };
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getFileList = this.getFileList.bind(this);
    this.validateFile = this.validateFile.bind(this);
    this.resetInputWithTimeout = this.resetInputWithTimeout.bind(this);
    this.keyLookup = this.keyLookup.bind(this);
    this.isFilePreviouslySaved = this.isFilePreviouslySaved.bind(this);
    
  }

  async keyLookup(event, fileName) {
    event.preventDefault();
    if (this.state.keys[fileName]) {
      const { dispatch } = this.props;
      const { apiRoot } = _config;
      const download = new localUpload();
      try {
        // await dispatch(refreshToken());
        let resp = await dispatch(listFileDownloadsByKey(this.state.keys[fileName]))
        if (resp.error) {
          console.log(`An error has occured on listFileDownloadsByKey: ${resp.error}.`);
        }
        resp = await download.downloadFile(this.state.keys[fileName], `${apiRoot}data/upload/downloadUrl`, loadToken().token)
        if (resp.error) {
          console.log(`An error has occured on downloadFile: ${resp.error}.`);
        }
      } catch (error) {
        console.log(`An error has occured on try catch key lookup: ${error.stack}.`);
      }
    }
  }

  async getFileList() {
    const { dispatch } = this.props;
    const { requestId } = this.props.match.params;
    if (requestId !== '' && requestId != undefined && requestId !== null) {
      dispatch(listFileUploadsBySubmission(requestId))
        .then((resp) => {
          let html = [];
          console.log(resp)
          /* resp1 = {
            "id": "49bfe09d-8a9c-4a42-bdca-aaf7a34e6944",
            "type": "UPLOAD",
            "data": [],
            "config": {
              "json": true,
              "resolveWithFullResponse": true,
              "simple": false,
              "type": "UPLOAD",
              "method": "GET",
              "id": "49bfe09d-8a9c-4a42-bdca-aaf7a34e6944",
              "path": "data/upload/list/49bfe09d-8a9c-4a42-bdca-aaf7a34e6944",
              "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer eyJraWQiOiJmdjYyVTVidkVEYXJYaEZxbk9ZQ3dHNFB5akdUMHhSTjhIMTNGb010Y2lNPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjMjU5YTc0MS0xODIyLTQ4YTktYjZjMy05YTRlY2FhYzAzMzgiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6Im9wZW5pZCIsImF1dGhfdGltZSI6MTY5Mzk0MDA3OSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tXC91cy13ZXN0LTJfYVk1aTluVnk2IiwiZXhwIjoxNjkzOTQzNjc5LCJpYXQiOjE2OTM5NDAwODAsInZlcnNpb24iOjIsImp0aSI6ImU3YmQ0N2MzLTNkNzgtNDBlNC04YTY1LWQ1ZjBmMjU1MDQyMyIsImNsaWVudF9pZCI6IjZxcjBvcmlhMWFndmhuaTdqZjJjcmhnaWxxIiwidXNlcm5hbWUiOiI1a2IifQ.QQ8GDfkUK1ec3AUR02sShHfHXgQ2ZxON8EJIkM0nsq1YfzbijocV1pXJQZCFtYvEI_U2Jlm6_4h4BFVDUEqXho-tOBYcu18Jxx5IjlNu-0zA2fCDkDFJcKLJ7U-PZpK8MOScLaU4CyFTmNl5pAv4YFWNy5lgiNeF3G1ZZngbX9vty8GcrR4nkHtW4j-C2xzi1_Cam1PmfMQx_uOJcXo7lVHupo4XxhhB_ez6bVZXlo2aH0tHkXxDQEdfgbtJ9ibyNeBbxOHTFpZq_XF1cByQUtqyzcQY0qfp1bAfvwLCf_dKrbYgKExNe5EjtA7VVJKmLFiAi4MAL7ovLbxINvQedg"
              },
              "url": "https://pub.sit.earthdata.nasa.gov/api/data/upload/list/49bfe09d-8a9c-4a42-bdca-aaf7a34e6944"
            }
          } */
          /* resp2 =  {
            "id": "49bfe09d-8a9c-4a42-bdca-aaf7a34e6944",
            "type": "UPLOAD",
            "data": [
              {
                "key": "15df4fda-ed0d-417f-9124-558fb5e5b561/49bfe09d-8a9c-4a42-bdca-aaf7a34e6944/c259a741-1822-48a9-b6c3-9a4ecaac0338/Workplan Summary.pdf",
                "size": 39344,
                "lastModified": "2023-09-05T19:05:28.000Z",
                "file_name": "Workplan Summary.pdf"
              }
            ],
            "config": {
              "json": true,
              "resolveWithFullResponse": true,
              "simple": false,
              "type": "UPLOAD",
              "method": "GET",
              "id": "49bfe09d-8a9c-4a42-bdca-aaf7a34e6944",
              "path": "data/upload/list/49bfe09d-8a9c-4a42-bdca-aaf7a34e6944",
              "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer eyJraWQiOiJmdjYyVTVidkVEYXJYaEZxbk9ZQ3dHNFB5akdUMHhSTjhIMTNGb010Y2lNPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjMjU5YTc0MS0xODIyLTQ4YTktYjZjMy05YTRlY2FhYzAzMzgiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6Im9wZW5pZCIsImF1dGhfdGltZSI6MTY5Mzk0MDA3OSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tXC91cy13ZXN0LTJfYVk1aTluVnk2IiwiZXhwIjoxNjkzOTQzNjc5LCJpYXQiOjE2OTM5NDAwODAsInZlcnNpb24iOjIsImp0aSI6ImU3YmQ0N2MzLTNkNzgtNDBlNC04YTY1LWQ1ZjBmMjU1MDQyMyIsImNsaWVudF9pZCI6IjZxcjBvcmlhMWFndmhuaTdqZjJjcmhnaWxxIiwidXNlcm5hbWUiOiI1a2IifQ.QQ8GDfkUK1ec3AUR02sShHfHXgQ2ZxON8EJIkM0nsq1YfzbijocV1pXJQZCFtYvEI_U2Jlm6_4h4BFVDUEqXho-tOBYcu18Jxx5IjlNu-0zA2fCDkDFJcKLJ7U-PZpK8MOScLaU4CyFTmNl5pAv4YFWNy5lgiNeF3G1ZZngbX9vty8GcrR4nkHtW4j-C2xzi1_Cam1PmfMQx_uOJcXo7lVHupo4XxhhB_ez6bVZXlo2aH0tHkXxDQEdfgbtJ9ibyNeBbxOHTFpZq_XF1cByQUtqyzcQY0qfp1bAfvwLCf_dKrbYgKExNe5EjtA7VVJKmLFiAi4MAL7ovLbxINvQedg"
              },
              "url": "https://pub.sit.earthdata.nasa.gov/api/data/upload/list/49bfe09d-8a9c-4a42-bdca-aaf7a34e6944"
            }
          } */
          /* resp3 = {
            "id": "49bfe09d-8a9c-4a42-bdca-aaf7a34e6944",
            "type": "UPLOAD",
            "data": [
              {
                "key": "15df4fda-ed0d-417f-9124-558fb5e5b561/49bfe09d-8a9c-4a42-bdca-aaf7a34e6944/c259a741-1822-48a9-b6c3-9a4ecaac0338/Workplan Summary.pdf",
                "size": 39344,
                "lastModified": "2023-09-05T19:05:28.000Z",
                "file_name": "Workplan Summary.pdf"
              }
            ],
            "config": {
              "json": true,
              "resolveWithFullResponse": true,
              "simple": false,
              "type": "UPLOAD",
              "method": "GET",
              "id": "49bfe09d-8a9c-4a42-bdca-aaf7a34e6944",
              "path": "data/upload/list/49bfe09d-8a9c-4a42-bdca-aaf7a34e6944",
              "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer eyJraWQiOiJmdjYyVTVidkVEYXJYaEZxbk9ZQ3dHNFB5akdUMHhSTjhIMTNGb010Y2lNPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjMjU5YTc0MS0xODIyLTQ4YTktYjZjMy05YTRlY2FhYzAzMzgiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6Im9wZW5pZCIsImF1dGhfdGltZSI6MTY5Mzk0MDA3OSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tXC91cy13ZXN0LTJfYVk1aTluVnk2IiwiZXhwIjoxNjkzOTQzNjc5LCJpYXQiOjE2OTM5NDAwODAsInZlcnNpb24iOjIsImp0aSI6ImU3YmQ0N2MzLTNkNzgtNDBlNC04YTY1LWQ1ZjBmMjU1MDQyMyIsImNsaWVudF9pZCI6IjZxcjBvcmlhMWFndmhuaTdqZjJjcmhnaWxxIiwidXNlcm5hbWUiOiI1a2IifQ.QQ8GDfkUK1ec3AUR02sShHfHXgQ2ZxON8EJIkM0nsq1YfzbijocV1pXJQZCFtYvEI_U2Jlm6_4h4BFVDUEqXho-tOBYcu18Jxx5IjlNu-0zA2fCDkDFJcKLJ7U-PZpK8MOScLaU4CyFTmNl5pAv4YFWNy5lgiNeF3G1ZZngbX9vty8GcrR4nkHtW4j-C2xzi1_Cam1PmfMQx_uOJcXo7lVHupo4XxhhB_ez6bVZXlo2aH0tHkXxDQEdfgbtJ9ibyNeBbxOHTFpZq_XF1cByQUtqyzcQY0qfp1bAfvwLCf_dKrbYgKExNe5EjtA7VVJKmLFiAi4MAL7ovLbxINvQedg"
              },
              "url": "https://pub.sit.earthdata.nasa.gov/api/data/upload/list/49bfe09d-8a9c-4a42-bdca-aaf7a34e6944"
            }
          } 
          resp4 = {
            "id": "49bfe09d-8a9c-4a42-bdca-aaf7a34e6944",
            "type": "UPLOAD",
            "data": [
              {
                "key": "15df4fda-ed0d-417f-9124-558fb5e5b561/49bfe09d-8a9c-4a42-bdca-aaf7a34e6944/c259a741-1822-48a9-b6c3-9a4ecaac0338/Screenshot from 2023-08-04 13-45-08.png",
                "size": 21578,
                "lastModified": "2023-09-05T19:15:27.000Z",
                "file_name": "Screenshot from 2023-08-04 13-45-08.png"
              },
              {
                "key": "15df4fda-ed0d-417f-9124-558fb5e5b561/49bfe09d-8a9c-4a42-bdca-aaf7a34e6944/c259a741-1822-48a9-b6c3-9a4ecaac0338/Screenshot from 2023-09-01 10-00-20.png",
                "size": 78625,
                "lastModified": "2023-09-05T19:10:32.000Z",
                "file_name": "Screenshot from 2023-09-01 10-00-20.png"
              },
              {
                "key": "15df4fda-ed0d-417f-9124-558fb5e5b561/49bfe09d-8a9c-4a42-bdca-aaf7a34e6944/c259a741-1822-48a9-b6c3-9a4ecaac0338/Workplan Summary.pdf",
                "size": 39344,
                "lastModified": "2023-09-05T19:05:28.000Z",
                "file_name": "Workplan Summary.pdf"
              }
            ],
            "config": {
              "json": true,
              "resolveWithFullResponse": true,
              "simple": false,
              "type": "UPLOAD",
              "method": "GET",
              "id": "49bfe09d-8a9c-4a42-bdca-aaf7a34e6944",
              "path": "data/upload/list/49bfe09d-8a9c-4a42-bdca-aaf7a34e6944",
              "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer eyJraWQiOiJmdjYyVTVidkVEYXJYaEZxbk9ZQ3dHNFB5akdUMHhSTjhIMTNGb010Y2lNPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjMjU5YTc0MS0xODIyLTQ4YTktYjZjMy05YTRlY2FhYzAzMzgiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6Im9wZW5pZCIsImF1dGhfdGltZSI6MTY5Mzk0MDA3OSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tXC91cy13ZXN0LTJfYVk1aTluVnk2IiwiZXhwIjoxNjkzOTQzNjc5LCJpYXQiOjE2OTM5NDAwODAsInZlcnNpb24iOjIsImp0aSI6ImU3YmQ0N2MzLTNkNzgtNDBlNC04YTY1LWQ1ZjBmMjU1MDQyMyIsImNsaWVudF9pZCI6IjZxcjBvcmlhMWFndmhuaTdqZjJjcmhnaWxxIiwidXNlcm5hbWUiOiI1a2IifQ.QQ8GDfkUK1ec3AUR02sShHfHXgQ2ZxON8EJIkM0nsq1YfzbijocV1pXJQZCFtYvEI_U2Jlm6_4h4BFVDUEqXho-tOBYcu18Jxx5IjlNu-0zA2fCDkDFJcKLJ7U-PZpK8MOScLaU4CyFTmNl5pAv4YFWNy5lgiNeF3G1ZZngbX9vty8GcrR4nkHtW4j-C2xzi1_Cam1PmfMQx_uOJcXo7lVHupo4XxhhB_ez6bVZXlo2aH0tHkXxDQEdfgbtJ9ibyNeBbxOHTFpZq_XF1cByQUtqyzcQY0qfp1bAfvwLCf_dKrbYgKExNe5EjtA7VVJKmLFiAi4MAL7ovLbxINvQedg"
              },
              "url": "https://pub.sit.earthdata.nasa.gov/api/data/upload/list/49bfe09d-8a9c-4a42-bdca-aaf7a34e6944"
            }
          } resp4 = {
            "id": "49bfe09d-8a9c-4a42-bdca-aaf7a34e6944",
            "type": "UPLOAD",
            "data": [
              {
                "key": "15df4fda-ed0d-417f-9124-558fb5e5b561/49bfe09d-8a9c-4a42-bdca-aaf7a34e6944/c259a741-1822-48a9-b6c3-9a4ecaac0338/EDS_Process_Template.docx",
                "size": 261785,
                "lastModified": "2023-09-05T19:23:47.000Z",
                "file_name": "EDS_Process_Template.docx"
              },
              {
                "key": "15df4fda-ed0d-417f-9124-558fb5e5b561/49bfe09d-8a9c-4a42-bdca-aaf7a34e6944/c259a741-1822-48a9-b6c3-9a4ecaac0338/Screenshot from 2023-08-04 13-45-08.png",
                "size": 21578,
                "lastModified": "2023-09-05T19:15:27.000Z",
                "file_name": "Screenshot from 2023-08-04 13-45-08.png"
              },
              {
                "key": "15df4fda-ed0d-417f-9124-558fb5e5b561/49bfe09d-8a9c-4a42-bdca-aaf7a34e6944/c259a741-1822-48a9-b6c3-9a4ecaac0338/Screenshot from 2023-09-01 10-00-20.png",
                "size": 78625,
                "lastModified": "2023-09-05T19:10:32.000Z",
                "file_name": "Screenshot from 2023-09-01 10-00-20.png"
              },
              {
                "key": "15df4fda-ed0d-417f-9124-558fb5e5b561/49bfe09d-8a9c-4a42-bdca-aaf7a34e6944/c259a741-1822-48a9-b6c3-9a4ecaac0338/Workplan Summary.pdf",
                "size": 39344,
                "lastModified": "2023-09-05T19:05:28.000Z",
                "file_name": "Workplan Summary.pdf"
              }
            ],
            "config": {
              "json": true,
              "resolveWithFullResponse": true,
              "simple": false,
              "type": "UPLOAD",
              "method": "GET",
              "id": "49bfe09d-8a9c-4a42-bdca-aaf7a34e6944",
              "path": "data/upload/list/49bfe09d-8a9c-4a42-bdca-aaf7a34e6944",
              "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer eyJraWQiOiJmdjYyVTVidkVEYXJYaEZxbk9ZQ3dHNFB5akdUMHhSTjhIMTNGb010Y2lNPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjMjU5YTc0MS0xODIyLTQ4YTktYjZjMy05YTRlY2FhYzAzMzgiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6Im9wZW5pZCIsImF1dGhfdGltZSI6MTY5Mzk0MDA3OSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tXC91cy13ZXN0LTJfYVk1aTluVnk2IiwiZXhwIjoxNjkzOTQzNjc5LCJpYXQiOjE2OTM5NDAwODAsInZlcnNpb24iOjIsImp0aSI6ImU3YmQ0N2MzLTNkNzgtNDBlNC04YTY1LWQ1ZjBmMjU1MDQyMyIsImNsaWVudF9pZCI6IjZxcjBvcmlhMWFndmhuaTdqZjJjcmhnaWxxIiwidXNlcm5hbWUiOiI1a2IifQ.QQ8GDfkUK1ec3AUR02sShHfHXgQ2ZxON8EJIkM0nsq1YfzbijocV1pXJQZCFtYvEI_U2Jlm6_4h4BFVDUEqXho-tOBYcu18Jxx5IjlNu-0zA2fCDkDFJcKLJ7U-PZpK8MOScLaU4CyFTmNl5pAv4YFWNy5lgiNeF3G1ZZngbX9vty8GcrR4nkHtW4j-C2xzi1_Cam1PmfMQx_uOJcXo7lVHupo4XxhhB_ez6bVZXlo2aH0tHkXxDQEdfgbtJ9ibyNeBbxOHTFpZq_XF1cByQUtqyzcQY0qfp1bAfvwLCf_dKrbYgKExNe5EjtA7VVJKmLFiAi4MAL7ovLbxINvQedg"
              },
              "url": "https://pub.sit.earthdata.nasa.gov/api/data/upload/list/49bfe09d-8a9c-4a42-bdca-aaf7a34e6944"
            }
          } */
          if (JSON.stringify(resp) === '{}' || (resp.data && resp.data.length === 0)) {
            this.setState({ saved: 'None found' })
          } else if (resp.data && resp.data.error) {
            if (!resp.data.error.match(/not authorized/gi) && !resp.data.error.match(/not implemented/gi)) {
              const str = `An error has occurred while getting the list of files: ${resp.data.error}.`;
              this.setState({ saved: str })
            } else {
              this.setState({ saved: 'None found' })
            }
          } else {
            if (document.getElementById('previously-saved') !== null) {
              document.getElementById('previously-saved').replaceChildren();
            }
            const dataArr = resp.data;
            if(dataArr.length===0){
              html.push(<>None found<br /></>)
              return
            }
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
            console.log(this.state.saved)
            this.setState({ keys: tmpKeys });
          }
        });
    }
  }

  componentDidMount() {
    const { groupId } = this.props.match.params;
    const { requestId } = this.props.match.params;
    if ((requestId !== '' && requestId != undefined && requestId !== null) && 
        (groupId == '' || groupId === undefined || groupId === null)) {
      this.getFileList()
    }
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

  isFilePreviouslySaved(file){
    let alreadySaved = false;
    if (this.state.saved) {
      for (const ea in this.state.saved){
        let reactElement = this.state.saved[ea]
        for (const prop in reactElement){
          if (typeof reactElement[prop] === 'object' && 
            reactElement[prop] !== null && 
            reactElement[prop]['children'] !== null && 
            reactElement[prop]['children']!== undefined && 
            reactElement[prop]['children'].length > 0){
            for(const child in reactElement[prop]['children']){
              if (reactElement[prop]['children'][child]['props']['id'] !== undefined) {
                console.log(reactElement[prop]['children'][child])
              }
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

  validateFile(file){
    let valid = false;
    if (this.isFilePreviouslySaved(file)) {
      this.setState({ statusMsg: 'This file was already uploaded.' });
      this.resetInputWithTimeout('Please select a different file.', 2000)
    } else if (file.name.match(/\.([^\.]+)$/) !== null){
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
      const { dispatch } = this.props;
      const upload = new localUpload();
      const { requestId } = this.props.match.params;
      const { groupId } = this.props.match.params;
      const { apiRoot } = _config;
      try {
        // await dispatch(refreshToken());
        let payload = {
          fileObj: file,
          authToken: loadToken().token,
        }
        let prefix = ''
        if (requestId !== '' && requestId != undefined && requestId !== null) {
          payload['apiEndpoint'] = `${apiRoot}data/upload/getPostUrl`;
          payload['submissionId'] = requestId
        } else if (groupId !== '' && groupId != undefined && groupId !== null) {
          if (document.getElementById('prefix') !== undefined && document.getElementById('prefix') !== null && document.getElementById('prefix').value !== '') {
            prefix = document.getElementById('prefix').value
          }
          payload['apiEndpoint'] = `${apiRoot}data/upload/getGroupUploadUrl`;
          payload['endpointParams'] = {
            prefix: prefix,
            group_id: groupId
          }
        }
        console.log(payload) //Files are correct
        /* payload = {
          "fileObj": File,
          "authToken": "eyJraWQiOiJmdjYyVTVidkVEYXJYaEZxbk9ZQ3dHNFB5akdUMHhSTjhIMTNGb010Y2lNPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjMjU5YTc0MS0xODIyLTQ4YTktYjZjMy05YTRlY2FhYzAzMzgiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6Im9wZW5pZCIsImF1dGhfdGltZSI6MTY5Mzk0MDA3OSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tXC91cy13ZXN0LTJfYVk1aTluVnk2IiwiZXhwIjoxNjkzOTQzNjc5LCJpYXQiOjE2OTM5NDAwODAsInZlcnNpb24iOjIsImp0aSI6ImU3YmQ0N2MzLTNkNzgtNDBlNC04YTY1LWQ1ZjBmMjU1MDQyMyIsImNsaWVudF9pZCI6IjZxcjBvcmlhMWFndmhuaTdqZjJjcmhnaWxxIiwidXNlcm5hbWUiOiI1a2IifQ.QQ8GDfkUK1ec3AUR02sShHfHXgQ2ZxON8EJIkM0nsq1YfzbijocV1pXJQZCFtYvEI_U2Jlm6_4h4BFVDUEqXho-tOBYcu18Jxx5IjlNu-0zA2fCDkDFJcKLJ7U-PZpK8MOScLaU4CyFTmNl5pAv4YFWNy5lgiNeF3G1ZZngbX9vty8GcrR4nkHtW4j-C2xzi1_Cam1PmfMQx_uOJcXo7lVHupo4XxhhB_ez6bVZXlo2aH0tHkXxDQEdfgbtJ9ibyNeBbxOHTFpZq_XF1cByQUtqyzcQY0qfp1bAfvwLCf_dKrbYgKExNe5EjtA7VVJKmLFiAi4MAL7ovLbxINvQedg",
          "apiEndpoint": "https://pub.sit.earthdata.nasa.gov/api/data/upload/getPostUrl",
          "submissionId": "49bfe09d-8a9c-4a42-bdca-aaf7a34e6944"
        } 
        lastPayload = {
          "fileObj": File,
          "authToken": "eyJraWQiOiJmdjYyVTVidkVEYXJYaEZxbk9ZQ3dHNFB5akdUMHhSTjhIMTNGb010Y2lNPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjMjU5YTc0MS0xODIyLTQ4YTktYjZjMy05YTRlY2FhYzAzMzgiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6Im9wZW5pZCIsImF1dGhfdGltZSI6MTY5Mzk0MDA3OSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tXC91cy13ZXN0LTJfYVk1aTluVnk2IiwiZXhwIjoxNjkzOTQzNjc5LCJpYXQiOjE2OTM5NDAwODAsInZlcnNpb24iOjIsImp0aSI6ImU3YmQ0N2MzLTNkNzgtNDBlNC04YTY1LWQ1ZjBmMjU1MDQyMyIsImNsaWVudF9pZCI6IjZxcjBvcmlhMWFndmhuaTdqZjJjcmhnaWxxIiwidXNlcm5hbWUiOiI1a2IifQ.QQ8GDfkUK1ec3AUR02sShHfHXgQ2ZxON8EJIkM0nsq1YfzbijocV1pXJQZCFtYvEI_U2Jlm6_4h4BFVDUEqXho-tOBYcu18Jxx5IjlNu-0zA2fCDkDFJcKLJ7U-PZpK8MOScLaU4CyFTmNl5pAv4YFWNy5lgiNeF3G1ZZngbX9vty8GcrR4nkHtW4j-C2xzi1_Cam1PmfMQx_uOJcXo7lVHupo4XxhhB_ez6bVZXlo2aH0tHkXxDQEdfgbtJ9ibyNeBbxOHTFpZq_XF1cByQUtqyzcQY0qfp1bAfvwLCf_dKrbYgKExNe5EjtA7VVJKmLFiAi4MAL7ovLbxINvQedg",
          "apiEndpoint": "https://pub.sit.earthdata.nasa.gov/api/data/upload/getPostUrl",
          "submissionId": "49bfe09d-8a9c-4a42-bdca-aaf7a34e6944"
        }*/
        this.setState({ statusMsg: 'Uploading' });
        const resp = await upload.uploadFile(payload)
        console.log('resp after upload', resp)
        /* Upload successfull */
        if (resp.error) {
          console.log(`An error has occured on uploadFile: ${resp.error}.`);
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
          <div className='indented__details'>
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
            <><br></br><h1 className='heading--small' aria-labelledby='Files Previously Saved'>
                Files Previously Uploaded:
              </h1></>
            : null}
            {!this.state.saved && groupId === undefined ? <Loading /> : null}
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