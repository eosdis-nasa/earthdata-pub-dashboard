'use strict';
import React from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import ModelBuilder from '../ModelBuilder/model-builder';

class MetadataEditor extends React.Component {
  render () {
    return (
      <div className='page__metrics'>
        <div className='content__header'>
          <div className='row'>
            <h1 className='heading--xlarge'>Metadata Editor</h1>
          </div>
        </div>
        <div className='page__content'>
          <div className='wrapper__sidebar'>
            <div className='page__content--shortened'>
              <ModelBuilder/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}


export default withRouter(MetadataEditor);
