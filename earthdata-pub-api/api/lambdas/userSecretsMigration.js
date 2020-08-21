'use strict';

const KMS = require('earthdata-pub-api/aws-client/KMS');
const { dynamodbDocClient } = require('earthdata-pub-api/aws-client/services');
const { S3KeyPairUser } = require('earthdata-pub-api/common/key-pair-user');
const { isNonEmptyString } = require('earthdata-pub-api/common/string');
const { isNil } = require('earthdata-pub-api/common/util');
const User = require('../models/users');

const getDecryptedField = async (user, field) => {
  if (isNil(user[field])) return null;
  if (user.encrypted === false) return user[field];

  return KMS.decryptBase64String(user[field])
    .catch(() => S3KeyPairUser.decrypt(user[field]));
};

const migrateUser = async (user) => {
  const username = await getDecryptedField(user, 'username');
  const password = await getDecryptedField(user, 'password');

  const updates = {};
  if (isNonEmptyString(username)) updates.username = username;
  if (isNonEmptyString(password)) updates.password = password;

  const userModel = new User();
  return userModel.update({ id: user.id }, updates);
};

const handler = async () => {
  const scanResponse = await dynamodbDocClient().scan({
    TableName: process.env.UsersTable
  }).promise();

  await Promise.all(scanResponse.Items.map(migrateUser));
};

module.exports = { handler };
