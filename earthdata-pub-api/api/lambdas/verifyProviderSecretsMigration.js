'use strict';

const Logger = require('earthdata-pub-api/logger');
const KMS = require('earthdata-pub-api/aws-client/KMS');
const { dynamodbDocClient } = require('earthdata-pub-api/aws-client/services');
const { isNil } = require('earthdata-pub-api/common/util');

const verifyProvider = async (provider) => {
  if (provider.encrypted === true) {
    try {
      await KMS.decryptBase64String(provider.username);
      await KMS.decryptBase64String(provider.password);
    } catch (error) {
      const logger = new Logger({});
      logger.error(`Provider ${provider.id} credentials could not be decrypted using KMS. It is possible that you still need to run the providerSecretsMigration Lambda function.`);
      throw error;
    }
  } else {
    if (isNil(provider.username) && isNil(provider.password)) return;
    throw new Error(`Provider ${provider.id} has plaintext username or password. Must invoke the providerSecretsMigration Lambda function.`);
  }
};

const handler = async () => {
  const scanResponse = await dynamodbDocClient().scan({
    TableName: process.env.ProvidersTable
  }).promise();

  await Promise.all(scanResponse.Items.map(verifyProvider));
};

module.exports = { handler };
