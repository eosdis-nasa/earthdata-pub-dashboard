'use strict';

const Logger = require('earthdata-pub-api/logger');
const KMS = require('earthdata-pub-api/aws-client/KMS');
const { dynamodbDocClient } = require('earthdata-pub-api/aws-client/services');
const { isNil } = require('earthdata-pub-api/common/util');

const verifyUser = async (user) => {
  if (user.encrypted === true) {
    try {
      await KMS.decryptBase64String(user.username);
      await KMS.decryptBase64String(user.password);
    } catch (error) {
      const logger = new Logger({});
      logger.error(`User ${user.id} credentials could not be decrypted using KMS. It is possible that you still need to run the userSecretsMigration Lambda function.`);
      throw error;
    }
  } else {
    if (isNil(user.username) && isNil(user.password)) return;
    throw new Error(`User ${user.id} has plaintext username or password. Must invoke the userSecretsMigration Lambda function.`);
  }
};

const handler = async () => {
  const scanResponse = await dynamodbDocClient().scan({
    TableName: process.env.UsersTable
  }).promise();

  await Promise.all(scanResponse.Items.map(verifyUser));
};

module.exports = { handler };
