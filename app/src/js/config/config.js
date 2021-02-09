const config = {
  target: process.env.DAAC_NAME || 'local',
  environment: process.env.STAGE || 'development',
  nav: {
    order: ['requests'],
    exclude: {
      Logs: !process.env.KIBANAROOT
    }
  },
  apiRoot: process.env.APIROOT || 'http://localhost:8080',
  formsUrl: process.env.FORMS_URL || 'http://localhost:8081',
  overviewUrl: process.env.OVERVIEW_URL || 'https://pub.earthdata.nasa.gov/',
  awsRegion: process.env.AWS_REGION || 'us-west-2',
  oauthMethod: process.env.AUTH_METHOD || 'earthdata',
  kibanaRoot: process.env.KIBANAROOT || '',
  esRoot: process.env.ESROOT || '',
  showTeaMetrics: process.env.SHOW_TEA_METRICS || true,
  showDistributionAPIMetrics: process.env.SHOW_DISTRIBUTION_API_METRICS || false,
  graphicsPath: (process.env.BUCKET || ''),
  enableRecovery: process.env.ENABLE_RECOVERY || false,
  esUser: process.env.ES_USER || '',
  esPassword: process.env.ES_PASSWORD || '',
  servedByEarthdatapubAPI: process.env.SERVED_BY_EDPUB_API || '',
  APP_ID: process.env.APP_ID || 'Value is null'
};

module.exports = config;
