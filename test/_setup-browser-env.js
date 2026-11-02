require('browser-env')({ url: 'http://localhost' });

require.extensions['.svg'] = (module) => {
  module.exports = 'nasa-logo.svg';
};