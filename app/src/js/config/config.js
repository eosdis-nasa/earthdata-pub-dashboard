const config = {
  target: process.env.DAAC_NAME || 'local',
  environment: process.env.STAGE || 'development',
  nav: {
    order: ['requests'],
    exclude: {
      Logs: !process.env.KIBANAROOT
    }
  },
  apiRoot: process.env.APIROOT || 'http://localhost:8080/api',
  overviewUrl: process.env.OVERVIEW_URL || '/',
  basepath: process.env.BASEPATH || '/',
  awsRegion: process.env.AWS_REGION || 'us-west-2',
  oauthMethod: process.env.AUTH_METHOD || 'earthdata',
  kibanaRoot: process.env.KIBANAROOT || '',
  esRoot: process.env.ESROOT || '',
  showDistributionAPIMetrics: process.env.SHOW_DISTRIBUTION_API_METRICS || false,
  graphicsPath: (process.env.BUCKET || ''),
  enableRecovery: process.env.ENABLE_RECOVERY || false,
  esUser: process.env.ES_USER || '',
  esPassword: process.env.ES_PASSWORD || '',
  servedByEarthdatapubAPI: process.env.SERVED_BY_EDPUB_API || '',
  APP_ID: process.env.APP_ID || 'Value is null',
  requestHideButtonVerbage: process.env.REQUEST_HIDE_BUTTON_VERBAGE || 'Withdraw',
  requestUnHideButtonVerbage: process.env.REQUEST_UNHIDE_BUTTON_VERBAGE || 'Restore',
  helpPageDefault: process.env.BASEPATH  || (process.env.OVERVIEW_URL || '/'),
  logoutUrl: process.env.LOGOUT_URL || 'http://localhost:3000/logout',
  cognitoClientLogoutUrl: process.env.COGNITO_CLIENT_LOGOUT_URL || ''
};

module.exports = config;
