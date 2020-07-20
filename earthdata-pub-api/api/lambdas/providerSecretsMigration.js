'use strict';

const KMS = require('earthdata-pub-api/aws-client/KMS');
const { dynamodbDocClient } = require('earthdata-pub-api/aws-client/services');
const { S3KeyPairProvider } = require('earthdata-pub-api/common/key-pair-provider');
const { isNonEmptyString } = require('earthdata-pub-api/common/string');
const { isNil } = require('earthdata-pub-api/common/util');
const Provider = require('../models/providers');

const getDecryptedField = async (provider, field) => {
  if (isNil(provider[field])) return null;
  if (provider.encrypted === false) return provider[field];

  return KMS.decryptBase64String(provider[field])
    .catch(() => S3KeyPairProvider.decrypt(provider[field]));
};

const migrateProvider = async (provider) => {
  const username = await getDecryptedField(provider, 'username');
  const password = await getDecryptedField(provider, 'password');

  const updates = {};
  if (isNonEmptyString(username)) updates.username = username;
  if (isNonEmptyString(password)) updates.password = password;

  const providerModel = new Provider();
  return providerModel.update({ id: provider.id }, updates);
};

const handler = async () => {
  const scanResponse = await dynamodbDocClient().scan({
    TableName: process.env.ProvidersTable
  }).promise();

  await Promise.all(scanResponse.Items.map(migrateProvider));
};

module.exports = { handler };
