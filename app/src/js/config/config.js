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
  formsUrl: process.env.FORMS_URL || 'http://localhost:8081',
  overviewUrl: process.env.OVERVIEW_URL || '/',
  initiateRequestSelectDaac: process.env.INTITIATE_REQUEST_SELECT_DAAC_URL || '/daacs/selection',
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
  requestUnHideButtonVerbage: process.env.REQUEST_UNHIDE_BUTTON_VERBAGE || 'Restore'
};

module.exports = config;
