const { isNil } = require('@cumulus/common/util');

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
