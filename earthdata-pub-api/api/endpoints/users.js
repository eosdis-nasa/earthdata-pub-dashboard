'use strict';

const router = require('express-promise-router')();
const { inTestMode } = require('earthdata-pub-api/common/test-utils');
const { RecordDoesNotExist } = require('earthdata-pub-api/errors');
const models = require('../models');
const { AssociatedRulesError } = require('../lib/errors');
const { Search } = require('../es/search');
const { addToLocalES, indexUser } = require('../es/indexer');

/**
 * List all users
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @returns {Promise<Object>} the promise of express response object
 */
async function list(req, res) {
  const search = new Search(
    { queryStringParameters: req.query },
    'user',
    process.env.ES_INDEX
  );

  const response = await search.query();
  return res.send(response);
}

/**
 * Query a single user
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @returns {Promise<Object>} the promise of express response object
 */
async function get(req, res) {
  const id = req.params.id;

  const userModel = new models.User();
  let result;
  try {
    result = await userModel.get({ id });
  } catch (error) {
    if (error instanceof RecordDoesNotExist) return res.boom.notFound('User not found.');
  }
  delete result.password;
  return res.send(result);
}

/**
 * Creates a new user
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @returns {Promise<Object>} the promise of express response object
 */
async function post(req, res) {
  const data = req.body;
  const id = data.id;

  const userModel = new models.User();

  try {
    // make sure the record doesn't exist
    await userModel.get({ id });
    return res.boom.badReqest(`A record already exists for ${id}`);
  } catch (e) {
    if (e instanceof RecordDoesNotExist) {
      const record = await userModel.create(data);

      if (inTestMode()) {
        await addToLocalES(record, indexUser);
      }
      return res.send({ record, message: 'Record saved' });
    }
    return res.boom.badImplementation(e.message);
  }
}

/**
 * Updates an existing user
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @returns {Promise<Object>} the promise of express response object
 */
async function put({ params: { id }, body }, res) {
  if (id !== body.id) {
    return res.boom.badRequest(
      `Expected user ID to be '${id}', but found '${body.id}' in payload`
    );
  }

  const userModel = new models.User();

  return (!(await userModel.exists(id)))
    ? res.boom.notFound(`User with ID '${id}' not found`)
    : userModel.create(body)
      .then((record) => (
        inTestMode()
          ? addToLocalES(record, indexUser).then(() => record)
          : record
      ))
      .then((record) => res.send(record));
}

/**
 * Delete a user
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @returns {Promise<Object>} the promise of express response object
 */
async function del(req, res) {
  const userModel = new models.User();

  try {
    await userModel.delete({ id: req.params.id });

    if (inTestMode()) {
      const esClient = await Search.es(process.env.ES_HOST);
      await esClient.delete({
        id: req.params.id,
        type: 'user',
        index: process.env.ES_INDEX
      }, { ignore: [404] });
    }
    return res.send({ message: 'Record deleted' });
  } catch (err) {
    if (err instanceof AssociatedRulesError) {
      const message = `Cannot delete user with associated rules: ${err.rules.join(', ')}`;
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
