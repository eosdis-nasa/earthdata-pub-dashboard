'use strict';

const cloneDeep = require('lodash/cloneDeep');
const get = require('lodash/get');
const partial = require('lodash/partial');
const path = require('path');

const Lambda = require('earthdata-pub-api/aws-client/Lambda');
const s3Utils = require('earthdata-pub-api/aws-client/S3');
const secretsManagerUtils = require('earthdata-pub-api/aws-client/SecretsManager');
const StepFunctions = require('earthdata-pub-api/aws-client/StepFunctions');
const { CMR } = require('earthdata-pub-api/cmr-client');
const cmrjs = require('earthdata-pub-api/cmrjs');
const launchpad = require('earthdata-pub-api/common/launchpad');
const log = require('earthdata-pub-api/common/log');
const { getCollectionIdFromMessage } = require('earthdata-pub-api/message/Collections');
const { getMessageExecutionArn } = require('earthdata-pub-api/message/Executions');
const { getMessageSubmissions } = require('earthdata-pub-api/message/Submissions');
const { buildURL } = require('earthdata-pub-api/common/URLUtils');
const {
  isNil,
  removeNilProperties,
  renameProperty
} = require('earthdata-pub-api/common/util');
const {
  generateMoveFileParams,
  moveSubmissionFiles
} = require('earthdata-pub-api/ingest/submission');

const Manager = require('./base');

const { buildDatabaseFiles } = require('../lib/FileUtils');
const { translateSubmission } = require('../lib/submissions');
const SubmissionSearchQueue = require('../lib/SubmissionSearchQueue');

const {
  parseException,
  deconstructCollectionId,
  getSubmissionProductVolume
} = require('../lib/utils');
const Rule = require('./rules');
const submissionSchema = require('./schemas').submission;

class Submission extends Manager {
  constructor() {
    const globalSecondaryIndexes = [{
      IndexName: 'collectionId-submissionId-index',
      KeySchema: [
        {
          AttributeName: 'collectionId',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'submissionId',
          KeyType: 'RANGE'
        }
      ],
      Projection: {
        ProjectionType: 'ALL'
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 10
      }
    }];

    super({
      tableName: process.env.SubmissionsTable,
      tableHash: { name: 'submissionId', type: 'S' },
      tableAttributes: [{ name: 'collectionId', type: 'S' }],
      tableIndexes: { GlobalSecondaryIndexes: globalSecondaryIndexes },
      schema: submissionSchema
    });
  }

  async get(...args) {
    return translateSubmission(await super.get(...args));
  }

  async batchGet(...args) {
    const result = cloneDeep(await super.batchGet(...args));

    result.Responses[this.tableName] = await Promise.all(
      result.Responses[this.tableName].map(translateSubmission)
    );

    return result;
  }

  async scan(...args) {
    const scanResponse = await super.scan(...args);

    if (scanResponse.Items) {
      return {
        ...scanResponse,
        Items: await Promise.all(scanResponse.Items.map(translateSubmission))
      };
    }

    return scanResponse;
  }

  async removeSubmissionFromCmrBySubmission(submission) {
    log.info(`submissions.removeSubmissionFromCmrBySubmission ${submission.submissionId}`);

    if (!submission.submitted) {
      throw new Error(`Submission ${submission.submissionId} is not published to CMR, so cannot be removed from CMR`);
    }

    const params = {
      provider: process.env.cmr_provider,
      clientId: process.env.cmr_client_id
    };

    if (process.env.cmr_oauth_provider === 'launchpad') {
      const passphrase = await secretsManagerUtils.getSecretString(
        process.env.launchpad_passphrase_secret_name
      );

      const token = await launchpad.getLaunchpadToken({
        passphrase,
        api: process.env.launchpad_api,
        certificate: process.env.launchpad_certificate
      });

      params.token = token;
    } else {
      params.username = process.env.cmr_username;
      params.password = await secretsManagerUtils.getSecretString(
        process.env.cmr_password_secret_name
      );
    }

    const cmr = new CMR(params);
    const metadata = await cmrjs.getMetadata(submission.cmrLink);

    // Use submission UR to delete from CMR
    await cmr.deleteSubmission(metadata.title, submission.submissionId);
    await this.update({ submissionId: submission.submissionId }, { submitted: false }, ['cmrLink']);
  }

  /**
   * start the re-ingest of a given submission object
   *
   * @param {Object} submission - the submission object
   * @returns {Promise<undefined>} - undefined
   */
  async reingest(submission) {
    const executionArn = path.basename(submission.execution);

    const executionDescription = await StepFunctions.describeExecution({ executionArn });
    const originalMessage = JSON.parse(executionDescription.input);

    const { name, version } = deconstructCollectionId(submission.collectionId);

    const lambdaPayload = await Rule.buildPayload({
      workflow: originalMessage.meta.workflow_name,
      meta: originalMessage.meta,
      earthdatapub_meta: {
        earthdatapub_context: {
          reingestSubmission: true,
          forceDuplicateOverwrite: true
        }
      },
      payload: originalMessage.payload,
      provider: submission.provider,
      collection: {
        name,
        version
      },
      queueName: submission.queueName
    });

    await this.updateStatus({ submissionId: submission.submissionId }, 'running');

    return Lambda.invoke(process.env.invoke, lambdaPayload);
  }

  /**
   * apply a workflow to a given submission object
   *
   * @param {Object} g - the submission object
   * @param {string} workflow - the workflow name
   * @param {string} [queueName] - specify queue to append message to
   * @param {string} [asyncOperationId] - specify asyncOperationId origin
   * @returns {Promise<undefined>} undefined
   */
  async applyWorkflow(
    g,
    workflow,
    queueName = undefined,
    asyncOperationId = undefined
  ) {
    const { name, version } = deconstructCollectionId(g.collectionId);

    const lambdaPayload = await Rule.buildPayload({
      workflow,
      payload: {
        submissions: [g]
      },
      provider: g.provider,
      collection: {
        name,
        version
      },
      queueName,
      asyncOperationId
    });

    await this.updateStatus({ submissionId: g.submissionId }, 'running');

    await Lambda.invoke(process.env.invoke, lambdaPayload);
  }

  /**
   * Move a submission's files to destinations specified
   *
   * @param {Object} g - the submission record object
   * @param {Array<{regex: string, bucket: string, filepath: string}>} destinations
   *    - list of destinations specified
   *    regex - regex for matching filepath of file to new destination
   *    bucket - aws bucket of the destination
   *    filepath - file path/directory on the bucket for the destination
   * @param {string} distEndpoint - distribution endpoint URL
   * @returns {Promise<undefined>} undefined
   */
  async move(g, destinations, distEndpoint) {
    log.info(`submissions.move ${g.submissionId}`);

    const updatedFiles = await moveSubmissionFiles(g.files, destinations);

    await cmrjs.reconcileCMRMetadata({
      submissionId: g.submissionId,
      updatedFiles,
      distEndpoint,
      published: g.published
    });

    return this.update(
      { submissionId: g.submissionId },
      {
        files: updatedFiles.map(partial(renameProperty, 'name', 'fileName'))
      }
    );
  }

  /**
   * With the params for moving a submission, return the files that already exist at
   * the move location
   *
   * @param {Object} submission - the submission object
   * @param {Array<{regex: string, bucket: string, filepath: string}>} destinations
   * - list of destinations specified
   *    regex - regex for matching filepath of file to new destination
   *    bucket - aws bucket of the destination
   *    filepath - file path/directory on the bucket for the destination
   * @returns {Promise<Array<Object>>} - promise that resolves to a list of files
   * that already exist at the destination that they would be written to if they
   * were to be moved via the move submissions call
   */
  async getFilesExistingAtLocation(submission, destinations) {
    const moveFileParams = generateMoveFileParams(submission.files, destinations);

    const fileExistsPromises = moveFileParams.map(async (moveFileParam) => {
      const { target, file } = moveFileParam;
      if (target) {
        const exists = await s3Utils.fileExists(target.Bucket, target.Key);

        if (exists) {
          return Promise.resolve(file);
        }
      }

      return Promise.resolve();
    });

    const existingFiles = await Promise.all(fileExistsPromises);

    return existingFiles.filter((file) => file);
  }

  /**
   * Build a submission record.
   *
   * @param {Object} submission - A submission object
   * @param {Object} message - A workflow execution message
   * @param {string} executionUrl - A Step Function execution URL
   * @param {Object} [executionDescription={}] - Defaults to empty object
   * @param {Date} executionDescription.startDate - Start date of the workflow execution
   * @param {Date} executionDescription.stopDate - Stop date of the workflow execution
   * @returns {Object} - A submission record
   */
  static async generateSubmissionRecord(
    submission,
    message,
    executionUrl,
    executionDescription = {}
  ) {
    if (!submission.submissionId) throw new Error(`Could not create submission record, invalid submissionId: ${submission.submissionId}`);
    const collectionId = getCollectionIdFromMessage(message);

    const submissionFiles = await buildDatabaseFiles({
      providerURL: buildURL({
        protocol: message.meta.provider.protocol,
        host: message.meta.provider.host,
        port: message.meta.provider.port
      }),
      files: submission.files
    });

    const temporalInfo = await cmrjs.getSubmissionTemporalInfo(submission);

    const { startDate, stopDate } = executionDescription;
    const processingTimeInfo = {};
    if (startDate) {
      processingTimeInfo.processingStartDateTime = startDate.toISOString();
      processingTimeInfo.processingEndDateTime = stopDate
        ? stopDate.toISOString()
        : new Date().toISOString();
    }

    const now = Date.now();

    const record = {
      submissionId: submission.submissionId,
      pdrName: get(message, 'meta.pdr.name'),
      collectionId,
      status: get(message, 'meta.status', get(submission, 'status')),
      provider: get(message, 'meta.provider.id'),
      execution: executionUrl,
      cmrLink: submission.cmrLink,
      files: submissionFiles,
      error: parseException(message.exception),
      createdAt: get(message, 'earthdatapub_meta.workflow_start_time'),
      timestamp: now,
      updatedAt: now,
      productVolume: getSubmissionProductVolume(submissionFiles),
      timeToPreprocess: get(submission, 'sync_submission_duration', 0) / 1000,
      timeToArchive: get(submission, 'post_to_cmr_duration', 0) / 1000,
      ...processingTimeInfo,
      ...temporalInfo
    };

    record.published = get(submission, 'published', false);
    // Duration is also used as timeToXfer for the EMS report
    record.duration = (record.timestamp - record.createdAt) / 1000;

    return removeNilProperties(record);
  }

  /**
   * return the queue of the submissions for a given collection,
   * the items are ordered by submissionId
   *
   * @param {string} collectionId - collection id
   * @param {string} status - submission status, optional
   * @returns {Array<Object>} the submissions' queue for a given collection
   */
  getSubmissionsForCollection(collectionId, status) {
    const params = {
      TableName: this.tableName,
      IndexName: 'collectionId-submissionId-index',
      ExpressionAttributeNames: {
        '#collectionId': 'collectionId',
        '#submissionId': 'submissionId',
        '#files': 'files',
        '#published': 'published',
        '#createdAt': 'createdAt'
      },
      ExpressionAttributeValues: { ':collectionId': collectionId },
      KeyConditionExpression: '#collectionId = :collectionId',
      ProjectionExpression: '#submissionId, #collectionId, #files, #published, #createdAt'
    };

    // add status filter
    if (status) {
      params.ExpressionAttributeNames['#status'] = 'status';
      params.ExpressionAttributeValues[':status'] = status;
      params.FilterExpression = '#status = :status';
    }

    return new SubmissionSearchQueue(params, 'query');
  }

  submissionAttributeScan() {
    const params = {
      TableName: this.tableName,
      ExpressionAttributeNames:
        {
          '#submissionId': 'submissionId',
          '#collectionId': 'collectionId',
          '#beginningDateTime': 'beginningDateTime',
          '#endingDateTime': 'endingDateTime',
          '#createdAt': 'createdAt'
        },
      ProjectionExpression: '#submissionId, #collectionId, #createdAt, #beginningDateTime, #endingDateTime'
    };

    return new SubmissionSearchQueue(params);
  }

  /**
   * Only used for tests
   */
  async deleteSubmissions() {
    const submissions = await this.scan();
    return Promise.all(submissions.Items.map((submission) =>
      super.delete({ submissionId: submission.submissionId })));
  }

  /**
   * Get the set of fields which are mutable based on the submission status.
   *
   * @param {Object} record - A submission record
   * @returns {Array} - The array of mutable field names
   */
  _getMutableFieldNames(record) {
    if (record.status === 'running') {
      return ['updatedAt', 'timestamp', 'status', 'execution'];
    }
    return Object.keys(record);
  }

  /**
   * Parse a EarthdataPub message and build submission records for the embedded submissions.
   *
   * @param {Object} earthdatapubMessage - A EarthdataPub message
   * @returns {Promise<Array<Object>>} - An array of submission records
   */
  static async _getSubmissionRecordsFromEarthdataPubMessage(earthdatapubMessage) {
    const submissions = getMessageSubmissions(earthdatapubMessage);
    if (!submissions) {
      log.info(`No submissions to process in the payload: ${JSON.stringify(earthdatapubMessage.payload)}`);
      return [];
    }

    const executionArn = getMessageExecutionArn(earthdatapubMessage);
    const executionUrl = StepFunctions.getExecutionUrl(executionArn);

    let executionDescription;
    try {
      executionDescription = await StepFunctions.describeExecution({ executionArn });
    } catch (err) {
      log.error(`Could not describe execution ${executionArn}`, err);
    }

    const promisedSubmissionRecords = submissions
      .map(async (submission) => {
        try {
          return await Submission.generateSubmissionRecord(
            submission,
            earthdatapubMessage,
            executionUrl,
            executionDescription
          );
        } catch (err) {
          log.error(
            'Error handling submission records: ', err,
            'Execution message: ', earthdatapubMessage
          );
          return null;
        }
      });

    const submissionRecords = await Promise.all(promisedSubmissionRecords);

    return submissionRecords.filter((r) => !isNil(r));
  }

  /**
   * Validate and store a submission record.
   *
   * @param {Object} submissionRecord - A submission record.
   * @returns {Promise}
   */
  async _validateAndStoreSubmissionRecord(submissionRecord) {
    try {
      // TODO: Refactor this all to use model.update() to avoid having to manually call
      // schema validation and the actual client.update() method.
      await this.constructor.recordIsValid(submissionRecord, this.schema, this.removeAdditional);

      const mutableFieldNames = this._getMutableFieldNames(submissionRecord);
      const updateParams = this._buildDocClientUpdateParams({
        item: submissionRecord,
        itemKey: { submissionId: submissionRecord.submissionId },
        mutableFieldNames
      });

      // Only allow "running" submission to replace completed/failed
      // submission if the execution has changed
      if (submissionRecord.status === 'running') {
        updateParams.ConditionExpression = '#execution <> :execution';
      }

      await this.dynamodbDocClient.update(updateParams).promise();
    } catch (err) {
      log.error(
        'Could not store submission record: ', submissionRecord,
        err
      );
    }
  }

  /**
   * Generate and store submission records from a EarthdataPub message.
   *
   * @param {Object} earthdatapubMessage - EarthdataPub workflow message
   * @returns {Promise}
   */
  async storeSubmissionsFromEarthdataPubMessage(earthdatapubMessage) {
    const submissionRecords = await this.constructor
      ._getSubmissionRecordsFromEarthdataPubMessage(earthdatapubMessage);
    return Promise.all(submissionRecords.map(this._validateAndStoreSubmissionRecord, this));
  }
}

module.exports = Submission;
