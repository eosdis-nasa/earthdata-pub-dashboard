'use strict';

const isIp = require('is-ip');
const KMS = require('earthdata-pub-api/aws-client/KMS');
const { isNil } = require('earthdata-pub-api/common/util');
const { isValidHostname } = require('earthdata-pub-api/common/string');

const Manager = require('./base');
const Rule = require('./rules');
const schemas = require('./schemas');
const { AssociatedRulesError } = require('../lib/errors');

const encryptValueWithKMS = (value) =>
  KMS.encrypt(process.env.group_kms_key_id, value);

const buildValidationError = ({ detail }) => {
  const err = new Error('The record has validation errors');
  err.name = 'ValidationError';
  err.detail = detail;

  return err;
};

const validateHost = (host) => {
  if (isNil(host)) return;
  if (isValidHostname(host)) return;
  if (isIp(host)) return;

  throw buildValidationError({
    detail: `${host} is not a valid hostname or IP address`
  });
};

class Group extends Manager {
  static recordIsValid(item, schema = null) {
    super.recordIsValid(item, schema);

    validateHost(item.host);
  }

  constructor() {
    super({
      tableName: process.env.GroupsTable,
      tableHash: { name: 'id', type: 'S' },
      schema: schemas.group
    });

    this.removeAdditional = 'all';
  }

  /**
   * Check if a given group exists
   *
   * @param {string} id - group id
   * @returns {boolean}
   */
  exists(id) {
    return super.exists({ id });
  }

  /**
   * Delete a group
   *
   * @param {string} id - the group id
   */
  async delete({ id }) {
    /*const associatedRuleNames = (await this.getAssociatedRules(id))
      .map((rule) => rule.name);

    if (associatedRuleNames.length > 0) {
      throw new AssociatedRulesError(
        'Cannot delete a group that has associated rules',
        associatedRuleNames
      );
    }*/

    await super.delete({ id });
  }

  async deleteGroups() {
    const groups = await this.scan();
    return Promise.all(groups.Items.map((p) => this.delete({ id: p.id })));
  }

  /**
   * Get any rules associated with the group
   *
   * @param {string} id - the group id
   * @returns {Promise<boolean>}
   */
  async getAssociatedRules(id) {
    const ruleModel = new Rule();

    const scanResult = await ruleModel.scan({
      values: { ':group': id }
    });

    return scanResult.Items;
  }
}

module.exports = Group;
