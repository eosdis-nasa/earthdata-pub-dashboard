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

            download
                .downloadFile(
                    `attachments/${decodeURIComponent(s3BucketUrl)}`,
                    `${apiRoot}data/upload/downloadUrl`,
                    loadToken().token
                )
                .then((resp) => {
                    let error =
                        resp?.data?.error || resp?.error || resp?.data?.[0]?.error;

                    if (error) {
                        console.error(`An error has occurred: ${error}.`);
                    } else {
                        console.log('Download completed successfully.');
                        // Close the tab after successful download
                        window.close();
                    }
                })
                .catch((err) => {
                    console.error('Error during file download:', err);
                });
        };

        const s3BucketUrl = this.props.location?.search.replace('?', '');

        if (s3BucketUrl) {
            handleDownload(s3BucketUrl);
        } else {
            console.error('No S3 bucket URL found in query parameters.');
        }
        return <div>Downloading...</div>;
    }
}

DownloadOverview.propTypes = {
    stats: PropTypes.object,
    dispatch: PropTypes.func,
    config: PropTypes.object,
    logs: PropTypes.object,
    tokens: PropTypes.object
};

export default withRouter(
    connect((state) => ({
        stats: state.stats,
        config: state.config,
        logs: state.logs,
        tokens: state.api.tokens
    }))(DownloadOverview)
);
