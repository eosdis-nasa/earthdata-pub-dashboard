'use strict';

const router = require('express-promise-router')();
const { inTestMode } = require('earthdata-pub-api/common/test-utils');
const { RecordDoesNotExist } = require('earthdata-pub-api/errors');
const models = require('../models');
const { AssociatedRulesError } = require('../lib/errors');
const { Search } = require('../es/search');
const { addToLocalES, indexGroup } = require('../es/indexer');

/**
 * List all groups
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @returns {Promise<Object>} the promise of express response object
 */
async function list(req, res) {
  const search = new Search(
    { queryStringParameters: req.query },
    'group',
    process.env.ES_INDEX
  );

  const response = await search.query();
  return res.send(response);
}

/**
 * Query a single group
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @returns {Promise<Object>} the promise of express response object
 */
async function get(req, res) {
  const id = req.params.id;

  const groupModel = new models.Group();
  let result;
  try {
    result = await groupModel.get({ id });
  } catch (error) {
    if (error instanceof RecordDoesNotExist) return res.boom.notFound('Group not found.');
  }
  delete result.password;
  return res.send(result);
}

/**
 * Creates a new group
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @returns {Promise<Object>} the promise of express response object
 */
async function post(req, res) {
  const data = req.body;
  const id = data.id;

  const groupModel = new models.Group();

  try {
    // make sure the record doesn't exist
    await groupModel.get({ id });
    return res.boom.badReqest(`A record already exists for ${id}`);
  } catch (e) {
    if (e instanceof RecordDoesNotExist) {
      const record = await groupModel.create(data);

      if (inTestMode()) {
        await addToLocalES(record, indexGroup);
      }
      return res.send({ record, message: 'Record saved' });
    }
    return res.boom.badImplementation(e.message);
  }
}

/**
 * Updates an existing group
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @returns {Promise<Object>} the promise of express response object
 */
async function put({ params: { id }, body }, res) {
  if (id !== body.id) {
    return res.boom.badRequest(
      `Expected group ID to be '${id}', but found '${body.id}' in payload`
    );
  }

  const groupModel = new models.Group();

  return (!(await groupModel.exists(id)))
    ? res.boom.notFound(`Group with ID '${id}' not found`)
    : groupModel.create(body)
      .then((record) => (
        inTestMode()
          ? addToLocalES(record, indexGroup).then(() => record)
          : record
      ))
      .then((record) => res.send(record));
}

/**
 * Delete a group
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @returns {Promise<Object>} the promise of express response object
 */
async function del(req, res) {
  const groupModel = new models.Group();

  try {
    await groupModel.delete({ id: req.params.id });

    if (inTestMode()) {
      const esClient = await Search.es(process.env.ES_HOST);
      await esClient.delete({
        id: req.params.id,
        type: 'group',
        index: process.env.ES_INDEX
      }, { ignore: [404] });
    }
    return res.send({ message: 'Record deleted' });
  } catch (err) {
    if (err instanceof AssociatedRulesError) {
      const message = `Cannot delete group with associated rules: ${err.rules.join(', ')}`;
      return res.boom.conflict(message);
    }
    throw err;
  }
}

// express routes
router.get('/:id', get);
router.put('/:id', put);
router.delete('/:id', del);
router.post('/', post);
router.get('/', list);

module.exports = router;
