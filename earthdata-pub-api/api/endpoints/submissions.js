'use strict';

const lodashGet = require('lodash/get');
const pMap = require('p-map');
const router = require('express-promise-router')();
const { deleteS3Object } = require('@cumulus/aws-client/S3');
const log = require('@cumulus/common/log');
const { inTestMode } = require('@cumulus/common/test-utils');
const Search = require('../es/search').Search;
const indexer = require('../es/indexer');
const models = require('../models');
const { deconstructCollectionId } = require('../lib/utils');

/**
 * List all submissions for a given collection.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @returns {Promise<Object>} the promise of express response object
 */
async function list(req, res) {
  const es = new Search(
    { queryStringParameters: req.query },
    'submission',
    process.env.ES_INDEX
  );

  const result = await es.query();

  return res.send(result);
}

/**
 * Update a single submission.
 * Supported Actions: reingest, move, applyWorkflow, RemoveFromCMR.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @returns {Promise<Object>} the promise of express response object
 */
async function put(req, res) {
  const submissionId = req.params.submissionName;
  const body = req.body;
  const action = body.action;

  if (!action) {
    return res.boom.badRequest('Action is missing');
  }

  const submissionModelClient = new models.Submission();
  const submission = await submissionModelClient.get({ submissionId });

  if (action === 'reingest') {
    const { name, version } = deconstructCollectionId(submission.collectionId);
    const collectionModelClient = new models.Collection();
    const collection = await collectionModelClient.get({ name, version });

    await submissionModelClient.reingest({ ...submission, queueName: process.env.backgroundQueueName });

    const response = {
      action,
      submissionId: submission.submissionId,
      status: 'SUCCESS'
    };

    if (collection.duplicateHandling !== 'replace') {
      response.warning = 'The submission files may be overwritten';
    }

    return res.send(response);
  }

  if (action === 'applyWorkflow') {
    await submissionModelClient.applyWorkflow(
      submission,
      body.workflow
    );

    return res.send({
      submissionId: submission.submissionId,
      action: `applyWorkflow ${body.workflow}`,
      status: 'SUCCESS'
    });
  }

  if (action === 'removeFromCmr') {
    await submissionModelClient.removeSubmissionFromCmrBySubmission(submission);

    return res.send({
      submissionId: submission.submissionId,
      action,
      status: 'SUCCESS'
    });
  }

  if (action === 'move') {
    const filesAtDestination = await submissionModelClient.getFilesExistingAtLocation(
      submission,
      body.destinations
    );

    if (filesAtDestination.length > 0) {
      const filenames = filesAtDestination.map((file) => file.fileName);
      const message = `Cannot move submission because the following files would be overwritten at the destination location: ${filenames.join(', ')}. Delete the existing files or reingest the source files.`;

      return res.boom.conflict(message);
    }

    await submissionModelClient.move(submission, body.destinations, process.env.DISTRIBUTION_ENDPOINT);

    return res.send({
      submissionId: submission.submissionId,
      action,
      status: 'SUCCESS'
    });
  }

  return res.boom.badRequest('Action is not supported. Choices are "applyWorkflow", "move", "reingest", or "removeFromCmr"');
}

/**
 * Delete a submission
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @returns {Promise<Object>} the promise of express response object
 */
async function del(req, res) {
  const submissionId = req.params.submissionName;
  log.info(`submissions.del ${submissionId}`);

  const submissionModelClient = new models.Submission();
  const submission = await submissionModelClient.get({ submissionId });

  if (submission.detail) {
    return res.boom.badRequest(submission);
  }

  if (submission.published) {
    return res.boom.badRequest('You cannot delete a submission that is published to CMR. Remove it from CMR first');
  }

  // remove files from s3
  await pMap(
    lodashGet(submission, 'files', []),
    ({ bucket, key }) => deleteS3Object(bucket, key)
  );

  await submissionModelClient.delete({ submissionId });

  if (inTestMode()) {
    const esClient = await Search.es(process.env.ES_HOST);
    await indexer.deleteRecord({
      esClient,
      id: submissionId,
      type: 'submission',
      parent: submission.collectionId,
      index: process.env.ES_INDEX,
      ignore: [404]
    });
  }

  return res.send({ detail: 'Record deleted' });
}

/**
 * Query a single submission.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @returns {Promise<Object>} the promise of express response object
 */
async function get(req, res) {
  let result;
  try {
    result = await (new models.Submission()).get({ submissionId: req.params.submissionName });
  } catch (err) {
    if (err.message.startsWith('No record found')) {
      return res.boom.notFound('Submission not found');
    }

    throw err;
  }

  return res.send(result);
}

async function bulk(req, res) {
  const payload = req.body;

  if (!payload.workflowName) {
    return res.boom.badRequest('workflowName is required.');
  }

  if (!payload.ids && !payload.query) {
    return res.boom.badRequest('One of ids or query is required');
  }

  if (payload.query
    && !(process.env.METRICS_ES_HOST
    && process.env.METRICS_ES_USER
    && process.env.METRICS_ES_PASS)) {
    return res.boom.badRequest('ELK Metrics stack not configured');
  }

  if (payload.query && !payload.index) {
    return res.boom.badRequest('Index is required if query is sent');
  }

  const asyncOperationModel = new models.AsyncOperation({
    stackName: process.env.stackName,
    systemBucket: process.env.system_bucket,
    tableName: process.env.AsyncOperationsTable
  });

  let description;

  if (payload.query) {
    description = `Bulk run ${payload.workflowName} on ${payload.query.size} submissions`;
  } else if (payload.ids) {
    description = `Bulk run ${payload.workflowName} on ${payload.ids.length} submissions`;
  } else {
    description = `Bulk run on ${payload.workflowName}`;
  }

  try {
    const asyncOperation = await asyncOperationModel.start({
      asyncOperationTaskDefinition: process.env.AsyncOperationTaskDefinition,
      cluster: process.env.EcsCluster,
      lambdaName: process.env.BulkOperationLambda,
      description,
      operationType: 'Bulk Submissions',
      payload: {
        payload,
        type: 'BULK_SUBMISSION',
        submissionsTable: process.env.SubmissionsTable,
        system_bucket: process.env.system_bucket,
        stackName: process.env.stackName,
        invoke: process.env.invoke,
        esHost: process.env.METRICS_ES_HOST,
        esUser: process.env.METRICS_ES_USER,
        esPassword: process.env.METRICS_ES_PASS
      },
      esHost: process.env.ES_HOST
    });

    return res.send(asyncOperation);
  } catch (err) {
    if (err.name !== 'EcsStartTaskError') throw err;

    return res.boom.serverUnavailable(`Failed to run ECS task: ${err.message}`);
  }
}

router.get('/:submissionName', get);
router.get('/', list);
router.put('/:submissionName', put);
router.post('/bulk', bulk);
router.delete('/:submissionName', del);

module.exports = router;
