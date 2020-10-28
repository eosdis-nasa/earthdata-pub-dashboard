'use strict';

const { getS3Object, listS3ObjectsV2 } = require('./aws');

const templateKey = (stack) => `${stack}/metric_template.json`;

const metricTemplateUri = (bucket, stack) => `s3://${bucket}/${templateKey(stack)}`;

const getMetricFileKey = (stackName, metricName) =>
  `${stackName}/metrics/${metricName}.json`;

const getMetricsListKeyPrefix = (stackName) => `${stackName}/metrics/`;

/**
 * Get the template JSON from S3 for the metric
 *
 * @param {string} stackName - Cloud formation stack name
 * @param {string} bucketName - S3 internal bucket name
 * @returns {Promise.<Object>} template as a JSON object
 */
async function getMetricTemplate (stackName, bucketName) {
  const key = templateKey(stackName);
  const templateJson = await getS3Object(bucketName, key);
  console.log(templateJson)
  return JSON.parse(templateJson.Body.toString());
}

/**
 * Get the definition file JSON from S3 for the metric
 *
 * @param {string} stackName - Cloud formation stack name
 * @param {string} bucketName - S3 internal bucket name
 * @param {string} metricName - metric name
 * @returns {Promise.<Object>} definition file as a JSON object
 */
async function getMetricFile (stackName, bucketName, metricName) {
  const key = `${stackName}/metrics/${metricName}.json`;
  const mJson = await getS3Object(bucketName, key);
  console.log(mJson.Body.toString());
  return JSON.parse(mJson.Body.toString());
}

/**
 * Get S3 object
 *
 * @param {string} stackName - Cloud formation stack name
 * @param {string} bucketName - S3 internal bucket name
 *
 * @returns {Promise.<Array>} list of metrics
 */
async function getMetricList (stackName, bucketName) {
  const metricsListKey = `${stackName}/metrics/`;
  const metrics = await listS3ObjectsV2({
    Bucket: bucketName,
    Prefix: metricsListKey
  });
  return Promise.all(metrics.map((obj) => getS3Object(bucketName, obj.Key)
    .then((r) => JSON.parse(r.Body.toString()))));
}

module.exports = {
  getMetricFileKey,
  getMetricFile,
  getMetricList,
  getMetricsListKeyPrefix,
  getMetricTemplate,
  templateKey,
  metricTemplateUri
};
