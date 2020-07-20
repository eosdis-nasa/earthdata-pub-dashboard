const { isNil } = require('earthdata-pub-api/common/util');

const { buildDatabaseFiles } = require('./FileUtils');

const translateSubmission = async (submission) => {
  if (isNil(submission.files)) return submission;

  return {
    ...submission,
    files: await buildDatabaseFiles({ files: submission.files })
  };
};

module.exports = {
  translateSubmission
};
