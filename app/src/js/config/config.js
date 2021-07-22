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
  newPublicationRequestUrl: process.env.NEW_PUBLICATION_REQUEST_URL || '/interest/daacs/selection',
  newProductInformationUrl: process.env.NEW_PRODUCT_INFORMATION_URL || '/questionnaire/questions',
  publicationRequestFormId: process.env.PUBLICATION_REQUEST_FORM_ID || '6c544723-241c-4896-a38c-adbc0a364293',
  productInformationFormId: process.env.PRODUCTION_INFORMATION_FORM_ID || '19025579-99ca-4344-8610-704dae626343',
  basepath: process.env.BASEPATH || '/',
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
