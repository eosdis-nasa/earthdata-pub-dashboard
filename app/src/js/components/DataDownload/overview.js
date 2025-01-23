'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import _config from '../../config';
import { loadToken } from '../../utils/auth';
import localUpload from '@edpub/upload-utility';
import { Alert } from 'react-bootstrap';

class DownloadOverview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            alertMessage: '',
            alertVariant: 'danger',
            dismissCountDown: 0,
            downloadAttempted: false,
            permanentMessage: 'Download in progress. This tab will close once the download is complete.'
        };
    }

    handleDownload = (s3BucketUrl) => {
        if (this.state.downloadAttempted) {
            return;
        }

        this.setState({ downloadAttempted: true });

        const { apiRoot } = _config;
        const download = new localUpload();

        download
            .downloadFile(
                `attachments/${decodeURIComponent(s3BucketUrl)}`,
                `${apiRoot}data/upload/downloadUrl`,
                loadToken().token
            )
            .then((resp) => {
                let error = resp?.data?.error || resp?.error || resp?.data?.[0]?.error;

                if (error) {
                    console.error(`An error has occurred: ${error}.`);
                    this.showAlert(`Error: ${error}`, 'danger');
                    this.setState({ permanentMessage: `Error: ${error}` });
                } else {
                    console.log('Download completed successfully.');
                    window.close();                         
                }
            })
            .catch((err) => {
                console.error('Error during file download:', err);
                this.showAlert('An error occurred during file download.', 'danger');
                this.setState({ permanentMessage: 'An error occurred during file download.' });
            });
    };

    showAlert = (message, variant) => {
        this.setState({ alertMessage: message, alertVariant: variant, dismissCountDown: 20 });

        // Automatically hide the alert after 20 seconds
        setTimeout(() => {
            this.setState({ dismissCountDown: 0 });
        }, 20000);
    };

    componentDidMount() {
        const s3BucketUrl = this.props.location?.search.replace('?', '');
        if (s3BucketUrl && !this.state.downloadAttempted) {
            this.handleDownload(s3BucketUrl);
        } else if (!s3BucketUrl) {
            console.error('No S3 bucket URL found in query parameters.');
            this.showAlert('No S3 bucket URL found.', 'danger');
            this.setState({ permanentMessage: 'No S3 bucket URL found.' }); 
        }
    }

    render() {
        const { alertMessage, alertVariant, dismissCountDown, permanentMessage } = this.state;

        return (
            <div>
                {dismissCountDown > 0 && (
                    <Alert
                        className="sticky-alert"
                        show={dismissCountDown > 0}
                        variant={alertVariant}
                        dismissible
                        onClose={() => this.setState({ dismissCountDown: 0 })}
                    >
                        {alertMessage}
                    </Alert>
                )}

                <h1
                    className="heading--shared-content"
                    style={{
                        fontWeight: 600,
                        fontSize: '2em',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    {permanentMessage}
                </h1>
            </div>
        );
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
