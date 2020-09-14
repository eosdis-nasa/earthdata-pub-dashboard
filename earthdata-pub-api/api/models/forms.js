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
  KMS.encrypt(process.env.form_kms_key_id, value);

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

class Form extends Manager {
  static recordIsValid(item, schema = null) {
    super.recordIsValid(item, schema);

    validateHost(item.host);
  }

  constructor() {
    super({
      tableName: process.env.FormsTable,
      tableHash: { name: 'id', type: 'S' },
      schema: schemas.form
    });

    this.removeAdditional = 'all';
  }

  /**
   * Check if a given form exists
   *
   * @param {string} id - form id
   * @returns {boolean}
   */
  exists(id) {
    return super.exists({ id });
  }

  /**
   * Delete a form
   *
   * @param {string} id - the form id
   */
  async delete({ id }) {
    const associatedRuleNames = (await this.getAssociatedRules(id))
      .map((rule) => rule.name);

    if (associatedRuleNames.length > 0) {
      throw new AssociatedRulesError(
        'Cannot delete a form that has associated rules',
        associatedRuleNames
      );
    }

    await super.delete({ id });
  }

  async deleteForms() {
    const forms = await this.scan();
    return Promise.all(forms.Items.map((p) => this.delete({ id: p.id })));
  }

  /**
   * Get any rules associated with the form
   *
   * @param {string} id - the form id
   * @returns {Promise<boolean>}
   */
  async getAssociatedRules(id) {
    const ruleModel = new Rule();

    const scanResult = await ruleModel.scan({
      filter: 'form = :form',
      values: { ':form': id }
    });

    return scanResult.Items;
  }
}

module.exports = Form;
