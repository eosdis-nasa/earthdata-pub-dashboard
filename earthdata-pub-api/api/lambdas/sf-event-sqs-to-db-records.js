'use strict';

const get = require('lodash/get');
const { parseSQSMessageBody } = require('earthdata-pub-api/aws-client/SQS');
const log = require('earthdata-pub-api/common/log');
const { getMessageExecutionArn } = require('earthdata-pub-api/message/Executions');
const Execution = require('../models/executions');
const Granule = require('../models/granules');
const Pdr = require('../models/pdrs');
const { getEarthdataPubMessageFromExecutionEvent } = require('../lib/cwSfExecutionEventUtils');

const saveExecutionToDb = async (earthdatapubMessage) => {
  const executionModel = new Execution();
  try {
    await executionModel.storeExecutionFromEarthdataPubMessage(earthdatapubMessage);
  } catch (err) {
    const executionArn = getMessageExecutionArn(earthdatapubMessage);
    log.fatal(`Failed to create/update database record for execution ${executionArn}: ${err.message}`);
  }
};

const savePdrToDb = async (earthdatapubMessage) => {
  const pdrModel = new Pdr();
  try {
    await pdrModel.storePdrFromEarthdataPubMessage(earthdatapubMessage);
  } catch (err) {
    const executionArn = getMessageExecutionArn(earthdatapubMessage);
    log.fatal(`Failed to create/update PDR database record for execution ${executionArn}: ${err.message}`);
  }
};

const saveGranulesToDb = async (earthdatapubMessage) => {
  const granuleModel = new Granule();

  try {
    await granuleModel.storeGranulesFromEarthdataPubMessage(earthdatapubMessage);
  } catch (err) {
    const executionArn = getMessageExecutionArn(earthdatapubMessage);
    log.fatal(`Failed to create/update granule records for execution ${executionArn}: ${err.message}`);
  }
};

const handler = async (event) => {
  const sqsMessages = get(event, 'Records', []);

  return Promise.all(sqsMessages.map(async (message) => {
    const executionEvent = parseSQSMessageBody(message);
    const earthdatapubMessage = await getEarthdataPubMessageFromExecutionEvent(executionEvent);

    return Promise.all([
      saveExecutionToDb(earthdatapubMessage),
      saveGranulesToDb(earthdatapubMessage),
      savePdrToDb(earthdatapubMessage)
    ]);
  }));
};

module.exports = {
  handler,
  saveExecutionToDb,
  saveGranulesToDb,
  savePdrToDb
};
