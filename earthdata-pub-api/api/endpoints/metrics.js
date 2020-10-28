'use strict';

const { getJsonS3Object, listS3ObjectsV2 } = require('earthdata-pub-api/aws-client/S3');
const {
  getMetricsListKeyPrefix,
  getMetricFileKey
} = require('earthdata-pub-api/common/metrics');
const router = require('express-promise-router')();

/**
 * List all providers.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @returns {Promise<Object>} the promise of express response object
 */
async function list (req, res) {
  const metrics = await listS3ObjectsV2({
    Bucket: process.env.system_bucket,
    Prefix: getMetricsListKeyPrefix(process.env.stackName)
  });
  const body = await Promise.all(metrics.map(
    (obj) => getJsonS3Object(process.env.system_bucket, obj.Key)
  ));
  // we have to specify type json here because express
  // does not recognize an array as json automatically
  return res.type('json').send(body);
}

/**
 * Query a single provider.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @returns {Promise<Object>} the promise of express response object
 */
async function get (req, res) {
  const name = req.params.name;
  try {
    const metric = await getJsonS3Object(
      process.env.system_bucket,
      getMetricFileKey(process.env.stackName, name)
    );
    return res.send(metric);
  } catch (err) {
    if (err.name === 'NoSuchKey' || err.name === 'NoSuchBucket') {
      return res.boom.notFound('Metric does not exist!');
    }
    throw err;
  }
}

router.get('/:name', get);
router.get('/', list);

module.exports = router;
