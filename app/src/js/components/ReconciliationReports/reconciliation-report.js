'use strict';
/* eslint node/no-deprecated-api: 0 */
import url from 'url';
import path from 'path';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import {
  interval,
  getReconciliationReport
} from '../../actions';
import _config from '../../config';
import {
  tableColumnsS3Files,
  tableColumnsFiles,
  tableColumnsCollections,
  tableColumnsGranules
} from '../../utils/table-config/reconciliation-reports';

import Metadata from '../Table/Metadata';
import Loading from '../LoadingIndicator/loading-indicator';
import ErrorReport from '../Errors/report';

import ReportTable from './report-table';

const { updateInterval } = _config;

const reportMetaAccessors = [
  { label: 'Created', property: 'reportStartTime' },
  { label: 'Status', property: 'status' },
  { label: 'Files in DynamoDB and S3', property: 'filesInEarthdatapub.okCount' },
  { label: 'Collections in Earthdatapub and CMR', property: 'collectionsInEarthdatapubCmr.okCount' },
  { label: 'Granules in Earthdatapub and CMR', property: 'granulesInEarthdatapubCmr.okCount' },
  { label: 'Granule files in Earthdatapub and CMR', property: 'filesInEarthdatapubCmr.okCount' }
];

const parseFileObject = (d) => {
  const parsed = url.parse(d.uri);
  return {
    granuleId: d.granuleId,
    filename: path.basename(parsed.pathname),
    bucket: parsed.hostname,
    path: parsed.href
  };
};

class ReconciliationReport extends React.Component {
  constructor () {
    super();
    this.reload = this.reload.bind(this);
    this.navigateBack = this.navigateBack.bind(this);
  }

  componentDidMount () {
    const { reconciliationReportName } = this.props.match.params;
    const immediate = !this.props.reconciliationReports.map[reconciliationReportName];
    this.reload(immediate);
  }

  componentWillUnmount () {
    if (this.cancelInterval) { this.cancelInterval(); }
  }

  reload (immediate) {
    const { reconciliationReportName } = this.props.match.params;
    const { dispatch } = this.props;
    if (this.cancelInterval) { this.cancelInterval(); }
    this.cancelInterval = interval(() => dispatch(getReconciliationReport(reconciliationReportName)), updateInterval, immediate);
  }

  navigateBack () {
    this.props.history.push('/reconciliations');
  }

  getFilesSummary ({
    onlyInDynamoDb = [],
    onlyInS3 = []
  }) {
    const filesInS3 = onlyInS3.map(d => {
      const parsed = url.parse(d);
      return {
        filename: path.basename(parsed.pathname),
        bucket: parsed.hostname,
        path: parsed.href
      };
    });

    const filesInDynamoDb = onlyInDynamoDb.map(parseFileObject);

    return { filesInS3, filesInDynamoDb };
  }

  getCollectionsSummary ({
    onlyInEarthdatapub = [],
    onlyInCmr = []
  }) {
    const getCollectionName = (collectionName) => ({ name: collectionName });
    const collectionsInEarthdatapub = onlyInEarthdatapub.map(getCollectionName);
    const collectionsInCmr = onlyInCmr.map(getCollectionName);
    return { collectionsInEarthdatapub, collectionsInCmr };
  }

  getGranulesSummary ({
    onlyInEarthdatapub = [],
    onlyInCmr = []
  }) {
    const granulesInEarthdatapub = onlyInEarthdatapub;
    const granulesInCmr = onlyInCmr.map((granule) => ({ granuleId: granule.GranuleUR }));
    return { granulesInEarthdatapub, granulesInCmr };
  }

  getGranuleFilesSummary ({
    onlyInEarthdatapub = [],
    onlyInCmr = []
  }) {
    const granuleFilesOnlyInEarthdatapub = onlyInEarthdatapub.map(parseFileObject);

    const granuleFilesOnlyInCmr = onlyInCmr.map(d => {
      const parsed = url.parse(d.URL);
      const bucket = parsed.hostname.split('.')[0];
      return {
        granuleId: d.GranuleUR,
        filename: path.basename(parsed.pathname),
        bucket,
        path: `s3://${bucket}${parsed.pathname}`
      };
    });

    return { granuleFilesOnlyInEarthdatapub, granuleFilesOnlyInCmr };
  }

  render () {
    const { reconciliationReports } = this.props;
    const { reconciliationReportName } = this.props.match.params;

    const record = reconciliationReports.map[reconciliationReportName];

    if (!record || (record.inflight && !record.data)) {
      return <Loading />;
    }

    let filesInS3 = [];
    let filesInDynamoDb = [];

    let granuleFilesOnlyInEarthdatapub = [];
    let granuleFilesOnlyInCmr = [];

    let collectionsInEarthdatapub = [];
    let collectionsInCmr = [];

    let granulesInEarthdatapub = [];
    let granulesInCmr = [];

    let report;

    if (record && record.data) {
      report = record.data;

      const {
        filesInEarthdatapub = {},
        filesInEarthdatapubCmr = {},
        collectionsInEarthdatapubCmr = {},
        granulesInEarthdatapubCmr = {}
      } = report;

      ({
        filesInS3,
        filesInDynamoDb
      } = this.getFilesSummary(filesInEarthdatapub));

      ({
        collectionsInEarthdatapub,
        collectionsInCmr
      } = this.getCollectionsSummary(collectionsInEarthdatapubCmr));

      ({
        granulesInEarthdatapub,
        granulesInCmr
      } = this.getGranulesSummary(granulesInEarthdatapubCmr));

      ({
        granuleFilesOnlyInEarthdatapub,
        granuleFilesOnlyInCmr
      } = this.getGranuleFilesSummary(filesInEarthdatapubCmr));
    }

    let error;
    if (record && record.data) {
      error = record.data.error;
    }

    return (
      <div className='page__component'>
        <section className='page__section page__section__header-wrapper'>
          <div className='page__section__header'>
            <h1 className='heading--large heading--shared-content with-description '>{reconciliationReportName}</h1>
            {error ? <ErrorReport report={error} /> : null}
          </div>
        </section>

        <section className='page__section'>
          <div className='page__section--small'>
            <div className='heading__wrapper--border'>
              <h2 className='heading--medium with-description'>Reconciliation report</h2>
            </div>
            <Metadata data={report} accessors={reportMetaAccessors} />
          </div>

          <ReportTable
            data={filesInDynamoDb}
            title='Files only in DynamoDB'
            tableColumns={tableColumnsFiles}
          />

          <ReportTable
            data={filesInS3}
            title='Files only in S3'
            tableColumns={tableColumnsS3Files}
          />

          <ReportTable
            data={collectionsInEarthdatapub}
            title='Collections only in Earthdatapub'
            tableColumns={tableColumnsCollections}
          />

          <ReportTable
            data={collectionsInCmr}
            title='Collections only in CMR'
            tableColumns={tableColumnsCollections}
          />

          <ReportTable
            data={granulesInEarthdatapub}
            title='Granules only in Earthdatapub'
            tableColumns={tableColumnsGranules}
          />

          <ReportTable
            data={granulesInCmr}
            title='Granules only in CMR'
            tableColumns={tableColumnsGranules}
          />

          <ReportTable
            data={granuleFilesOnlyInEarthdatapub}
            title='Granule files only in Earthdatapub'
            tableColumns={tableColumnsFiles}
          />

          <ReportTable
            data={granuleFilesOnlyInCmr}
            title='Granule files only in CMR'
            tableColumns={tableColumnsFiles}
          />
        </section>
      </div>
    );
  }
}

ReconciliationReport.propTypes = {
  reconciliationReports: PropTypes.object,
  dispatch: PropTypes.func,
  match: PropTypes.object,
  history: PropTypes.object
};

ReconciliationReport.defaultProps = {
  reconciliationReports: []
};

export { ReconciliationReport };
export default withRouter(connect(state => state)(ReconciliationReport));
