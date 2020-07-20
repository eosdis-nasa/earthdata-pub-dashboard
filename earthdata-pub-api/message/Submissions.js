'use strict';

/**
 * Utility functions for parsing submission information from a Cumulus message
 * @module Submissions
 *
 * @example
 * const Submissions = require('earthdata-pub-api/message/Submissions');
 */

const get = require('lodash.get');

/**
 * Get submissions from execution message.
 *
 * @param {Object} message - An execution message
 * @returns {Array<Object>|undefined} An array of submission objects, or
 *   undefined if `message.payload.submissions` is not set
 *
 * @alias module:Submissions
 */
const getMessageSubmissions = (message) => get(message, 'payload.submissions');

module.exports = {
  getMessageSubmissions
};
