'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import _config from '../../config';
import { loadToken } from '../../utils/auth';
import localUpload from '@edpub/upload-utility';


class DownloadOverview extends React.Component {

    render() {
        const download = new localUpload();

        const handleDownload = () => {
            const { apiRoot } = _config;
            download.downloadFile(`attachments/d0f6dee8-cd60-49b8-bf84-a6bdb3a7526f/file-11.pdf`, `${apiRoot}data/upload/downloadUrl`, loadToken().token).then((resp) => {
                let error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error
                if (error) {
                console.log(`An error has occurred: ${error}.`);
                }
            })
        };

        console.log('this.props', handleDownload())
        return (
            <div>Deepak</div>
        )
    }
}

DownloadOverview.propTypes = {
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
}))(DownloadOverview));
