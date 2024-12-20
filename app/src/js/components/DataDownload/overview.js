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

        const handleDownload = (s3BucketUrl) => {
            const { apiRoot } = _config;
            download.downloadFile(`attachments/${s3BucketUrl}`, `${apiRoot}data/upload/downloadUrl`, loadToken().token).then((resp) => {
                let error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error
                if (error) {
                console.log(`An error has occurred: ${error}.`);
                }
            })
        };
        const s3BucketUrl = this.props.location && this.props.location.search.replace('?', '');
        handleDownload(s3BucketUrl)
        console.log('this.props',s3BucketUrl )
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
