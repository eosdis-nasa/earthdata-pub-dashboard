const { testUtils } = require('earthdata-pub-api/api');
const serveUtils = require('earthdata-pub-api/api/bin/serveUtils');
const { eraseDataStack } = require('earthdata-pub-api/api/bin/serve');
const { localUserName } = require('earthdata-pub-api/api/bin/local-test-defaults');

const forms = require('../fixtures/seeds/formsFixture.json');
const groups = require('../fixtures/seeds/groupsFixture.json');
const metrics = require('../fixtures/seeds/metricsFixture.json');
const questions = require('../fixtures/seeds/questionsFixture.json');
const requests = require('../fixtures/seeds/requestsFixture.json');
const roles = require('../fixtures/seeds/rolesFixture.json');
const users = require('../fixtures/seeds/usersFixture.json');
const workflows = require('../fixtures/seeds/workflowsFixture.json');
const modules = require('../fixtures/seeds/modulesFixture.json');
const conversations = require('../fixtures/seeds/conversationsFixture.json');

function resetIt () {
  return Promise.all([
    eraseDataStack(),
    testUtils.setAuthorizedOAuthUsers([localUserName])
  ]);
}

function seedForms () {
  return serveUtils.addForms(forms.results);
}

function seedGroups () {
  return serveUtils.addGroups(groups.results);
}

function seedMetrics () {
  return serveUtils.addMetrics(metrics.results);
}

function seedQuestions () {
  return serveUtils.addQuestions(questions.results);
}

function seedRequests () {
  return serveUtils.addRequests(requests.results);
}

function seedRoles () {
  return serveUtils.addRoles(roles.results);
}

function seedUsers () {
  return serveUtils.addUsers(users.results);
}

function seedWorkflows () {
  return serveUtils.addWorkflows(workflows.results);
}

function seedModules () {
  return serveUtils.addModules(modules.results);
}

function seedConversations () {
  return serveUtils.addConversations(conversations.results);
}

function seedEverything () {
  return resetIt()
    .then(seedForms)
    .then(seedGroups)
    .then(seedMetrics)
    .then(seedQuestions)
    .then(seedRequests)
    .then(seedRoles)
    .then(seedUsers)
    .then(seedWorkflows)
    .then(seedModules)
    .then(seedConversations);
}

module.exports = {
  seedEverything,
  resetIt
};
