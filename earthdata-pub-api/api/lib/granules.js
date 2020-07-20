const { isNil } = require('earthdata-pub-api/common/util');

const { buildDatabaseFiles } = require('./FileUtils');

const translateGranule = async (granule) => {
  if (isNil(granule.files)) return granule;

  return {
    ...granule,
    files: await buildDatabaseFiles({ files: granule.files })
  };
};

module.exports = {
  translateGranule
};
