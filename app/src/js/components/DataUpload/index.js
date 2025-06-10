'use strict';
import React from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import PropTypes from 'prop-types';
import UploadOverview from './overview';
import UploadStep from './uploadStep';
import { strings } from '../locale';

class Upload extends React.Component {
  constructor () {
    super();
    this.displayName = strings.all_users;
  }

  render () {
    return (
      <div className='page__users'>
        <div className='content__header'>
          <div className='row'>
            <h1 className='heading--xlarge heading--shared-content'>Upload</h1>
          </div>
        </div>
        <div className='page__content'>
          <div className='wrapper__sidebar'>
            <Sidebar
              currentPath={this.props.location.pathname}
              params={this.props.params}
            />
            <div className='page__content--shortened'>
              <Switch>
                <Route exact path='/upload' component={UploadOverview} />
                <Route path='/upload/:requestId' component={UploadStep} />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Upload.propTypes = {
  children: PropTypes.object,
  location: PropTypes.object,
  params: PropTypes.object
};

export default withRouter(Upload);
