/**
 * The authoritative source for submission files is the `files` property of a
 * submission stored in the Submissions table in DynamoDB. There are times when, given
 * an S3 bucket and key, we need to determine what submission that object is
 * associated with. Relying on the Submissions table requires a full table scan,
 * which is inefficient and relatively expensive. To make that easier, there is
 * a Files table in DynamoDB. This table uses `bucket` and `key` as keys, and
 * contains a `submissionId` property. This table is _not_ an authoritative source,
 * though, and it's possible that it will not be in sync with the submissions
 * table.
 */

'use strict';

const AggregateError = require('aggregate-error');
const chunk = require('lodash/chunk');
const get = require('lodash/get');
const pick = require('lodash/pick');
const pMap = require('p-map');
const { noop } = require('earthdata-pub-api/common/util');
const { dynamodb, dynamodbDocClient } = require('earthdata-pub-api/aws-client/services');
const { isNonEmptyString } = require('earthdata-pub-api/common/string');

/**
 * Return the name of the Submission Files cache table
 * @returns {string} the name of the DynamoDB table
 */
const cacheTableName = () => {
  if (isNonEmptyString(process.env.FilesTable)) return process.env.FilesTable;
  throw new Error('process.env.FilesTable is not set');
};

const validatePutFile = (file) => {
  ['bucket', 'key', 'submissionId'].forEach((prop) => {
    if (!isNonEmptyString(file[prop])) {
      throw new TypeError(
        `${prop} is required in put request: ${JSON.stringify(file)}`
      );
    }
  });
};

const validateDeleteFile = (file) => {
  ['bucket', 'key'].forEach((prop) => {
    if (!isNonEmptyString(file[prop])) {
      throw new TypeError(
        `${prop} is required in delete request: ${JSON.stringify(file)}`
      );
    }
  });
};

const batchWriteItems = (items) =>
  dynamodbDocClient().batchWrite({
    RequestItems: { [cacheTableName()]: items }
  }).promise();

/**
 * Perform a bulk-update of the Submission Files cache table.
 *
 * Objects in the `puts` array will be added to the cache or update an existing
 * cache entry. `puts` objects must contain a `bucket`, `key`, and `submissionId`.
 *
 * Objects in the `deletes` array will be removed from the cache, and must
 * contain a `bucket` and `key`.
 *
 * This function will try to successfully complete as many operations as it can.
 * Any errors encountered will be thrown as part of an AggregateError.
 *
 * @param {Object} params
 * @param {Array<Object>} params.puts - a list of new files to be added to the
 *   cache
 * @param {Array<Object>} params.deletes - a list of files to be removed from
 *   the cache
 * @throws {AggregateError} - an AggregateError containing all of the errors
 *   that were thrown
 */
const batchUpdate = async (params = {}) => {
  const requestItems = [];
  const errors = [];

  get(params, 'puts', []).forEach((file) => {
    try {
      validatePutFile(file);

      requestItems.push({
        PutRequest: {
          Item: pick(file, ['bucket', 'key', 'submissionId'])
        }
      });
    } catch (error) {
      errors.push(error);
    }
  });

  get(params, 'deletes', []).forEach((file) => {
    try {
      validateDeleteFile(file);

      requestItems.push({
        DeleteRequest: {
          Key: pick(file, ['bucket', 'key'])
        }
      });
    } catch (error) {
      errors.push(error);
    }
  });

  // Perform the batch writes 25 at a time
  try {
    await pMap(
      chunk(requestItems, 25),
      batchWriteItems,
      { stopOnError: false }
    );
  } catch (batchWriteErrors) {
    Array.from(batchWriteErrors).forEach((error) => errors.push(error));
  }

  if (errors.length > 0) throw new AggregateError(errors);
};

/**
 * Create the Submission Files cache Dynamo DB table. This should only be used in
 * testing, since creation in the real world would be handled by Terraform.
 */
const createCacheTable = async () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('This function is for use in tests only');
  }

  await dynamodb().createTable({
    TableName: cacheTableName(),
    AttributeDefinitions: [
      { AttributeName: 'bucket', AttributeType: 'S' },
      { AttributeName: 'key', AttributeType: 'S' }
    ],
    KeySchema: [
      { AttributeName: 'bucket', KeyType: 'HASH' },
      { AttributeName: 'key', KeyType: 'RANGE' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  }).promise();

  await dynamodb().waitFor(
    'tableExists',
    { TableName: cacheTableName() }
  ).promise();
};

/**
 * Delete the Submission Files cache Dynamo DB table. This should only be used in
 * testing, since creation in the real world would be handled by Terraform.
 */
const deleteCacheTable = async () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('This function is for use in tests only');
  }

  await dynamodb().deleteTable({ TableName: cacheTableName() }).promise()
    .catch(noop);
};

/**
 * Fetch the submission id of an S3 object from the Submission Files cache
 *
 * @param {string} bucket - the bucket of the S3 object
 * @param {string} key - the key of the S3 object
 * @returns {string|null} - returns the submission id of the S3 object, or null if
 *   an entry was found in the cache
 */
const getSubmissionId = async (bucket, key) => {
  const getResponse = await dynamodbDocClient().get({
    TableName: cacheTableName(),
    Key: { bucket, key }
  }).promise();

  return getResponse.Item ? getResponse.Item.submissionId : null;
};

/**
 * Write a file to the Submission Files cache
 *
 * @param {Object} file
 * @param {string} file.bucket - the S3 bucket of the file
 * @param {string} file.key - the S3 key of the file
 * @param {string} file.submissionId - the submission ID of the file
 */
const put = async (file) => {
  await dynamodbDocClient().put({
    TableName: cacheTableName(),
    Item: file
  }).promise();
};

/**
 * Remove a file from the Submission Files cache
 *
 * @param {Object} file
 * @param {string} file.bucket - the S3 bucket of the file
 * @param {string} file.key - the S3 key of the file
 */
const del = async ({ bucket, key }) => {
  await dynamodbDocClient().delete({
    TableName: cacheTableName(),
    Key: { bucket, key }
  }).promise();
};

module.exports = {
  batchUpdate,
  cacheTableName,
  createCacheTable,
  del,
  deleteCacheTable,
  getSubmissionId,
  put
};
