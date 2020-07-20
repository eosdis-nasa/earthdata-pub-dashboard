const DynamoDbSearchQueue = require('earthdata-pub-api/aws-client/DynamoDbSearchQueue');
const { isNil } = require('earthdata-pub-api/common/util');

const { translateGranule } = require('./granules');

class GranuleSearchQueue extends DynamoDbSearchQueue {
  peek() {
    return super.peek().then((g) => (isNil(g) ? g : translateGranule(g)));
  }

  shift() {
    return super.shift().then((g) => (isNil(g) ? g : translateGranule(g)));
  }
}

module.exports = GranuleSearchQueue;
