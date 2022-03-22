// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************
// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const crypto = require('crypto');
const webpack = require('@cypress/webpack-preprocessor');

// const { testUtils } = require('earthdata-pub-api/api');
// const { createJwtToken } = require('earthdata-pub-api/api/lib/token');

// const { seedEverything } = require('./seedEverything');

process.env.TOKEN_SECRET = crypto.randomBytes(10).toString('hex');

module.exports = (on, config) => {
  const options = {
    // send in the options from your webpack.config.js, so it works the same
    // as your app's code
    webpackOptions: require('../../webpack.common'),
    watchOptions: {},
  };
  // const user = 'testUser';

  // Run specialized file preprocessor to transpile ES6+ -> ES5
  // This fixes compatibility issues with Electron
  on('file:preprocessor', webpack(options));

  /* on('task', {
     resetState: function () {
      return Promise.all([
        seedEverything(),
        testUtils.setAuthorizedOAuthUsers([user])
      ]).catch((error) => {
        console.log('You possibly have a bad fixture. Check the error below.');
        console.log(JSON.stringify(error, null, 2));
        Promise.reject(error);
      });
    },
    generateJWT: function (options) {
      return createJwtToken(options);
    },
    log (message) {
      console.log(message);
      return null;
    },
    failed: require('cypress-failed-log/src/failed')()
  }); */
  on('before:browser:launch', (browser = {}, launchOptions) => {
    // `args` is an array of all the arguments that will
    // be passed to browsers when it launches
    console.log(launchOptions.args); // print all current args

    if (browser.family === 'chromium' && browser.name !== 'electron') {
      // auto open devtools
      launchOptions.args.push('--auto-open-devtools-for-tabs');
    }

    if (browser.family === 'firefox') {
      // auto open devtools
      launchOptions.args.push('-devtools');
    }

    if (browser.name === 'electron') {
      // auto open devtools
      launchOptions.preferences.devTools = true;
    }

    if (browser.name === 'chrome' && browser.isHeadless) {
      // fullPage screenshot size is 1400x1200 on non-retina screens
      // and 2800x2400 on retina screens
      launchOptions.args.push('--window-size=1400,1200');

      // force screen to be non-retina (1400x1200 size)
      launchOptions.args.push('--force-device-scale-factor=1');

      // force screen to be retina (2800x2400 size)
      // launchOptions.args.push('--force-device-scale-factor=2')
    }

    if (browser.name === 'electron' && browser.isHeadless) {
      // fullPage screenshot size is 1400x1200
      launchOptions.preferences.width = 1400;
      launchOptions.preferences.height = 1200;
    }

    if (browser.name === 'firefox' && browser.isHeadless) {
      // menubars take up height on the screen
      // so fullPage screenshot size is 1400x1126
      launchOptions.args.push('--width=1400');
      launchOptions.args.push('--height=1200');
    }

    // whatever you return here becomes the launchOptions
    return launchOptions;
  });
};
