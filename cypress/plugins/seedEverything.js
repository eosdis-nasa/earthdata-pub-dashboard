const { testUtils } = require('earthdata-pub-api/api');
const serveUtils = require('earthdata-pub-api/api/bin/serveUtils');
const { eraseDataStack } = require('earthdata-pub-api/api/bin/serve');
const { localUserName } = require('earthdata-pub-api/api/bin/local-test-defaults');

const collections = require('../fixtures/seeds/collectionsFixture.json');
const executions = require('../fixtures/seeds/executionsFixture.json');
const granules = require('../fixtures/seeds/granulesFixture.json');
const submissions = require('../fixtures/seeds/submissionsFixture.json');
const providers = require('../fixtures/seeds/providersFixture.json');
const rules = require('../fixtures/seeds/rulesFixture.json');

function resetIt () {
  return Promise.all([
    eraseDataStack(),
    testUtils.setAuthorizedOAuthUsers([localUserName])
  ]);
}

function seedProviders () {
  return serveUtils.addProviders(providers.results);
}

function seedCollections () {
  return serveUtils.addCollections(collections.results);
}

function seedGranules () {
  return serveUtils.addGranules(granules.results);
}

function seedSubmissions () {
  return serveUtils.addSubmissions(submissions.results);
}

function seedExecutions () {
  return serveUtils.addExecutions(executions.results);
}

function seedRules () {
  return serveUtils.addRules(rules.results);
}

function seedEverything () {
  return resetIt()
    .then(seedRules)
    .then(seedCollections)
    .then(seedGranules)
    .then(seedSubmissions)
    .then(seedExecutions)
    .then(seedProviders);
}

module.exports = {
  seedEverything,
  resetIt
};
