const DynamoDbSearchQueue = require('earthdata-pub-api/aws-client/DynamoDbSearchQueue');
const { isNil } = require('earthdata-pub-api/common/util');

const { translateSubmission } = require('./submissions');

class SubmissionSearchQueue extends DynamoDbSearchQueue {
  peek() {
    return super.peek().then((g) => (isNil(g) ? g : translateSubmission(g)));
  }

  shift() {
    return super.shift().then((g) => (isNil(g) ? g : translateSubmission(g)));
  }
}

module.exports = SubmissionSearchQueue;
