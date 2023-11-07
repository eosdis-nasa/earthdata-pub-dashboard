'use strict';

import _config from '../config';

const formatKibanaDate = (datepicker = {}) => {
  const startTime = datepicker.startDateTime;
  const endTime = datepicker.endDateTime;
  let kibanaDate = '';

  if (startTime && endTime) {
    kibanaDate = `from:'${new Date(startTime).toISOString()}',to:'${new Date(endTime).toISOString()}'`;
  } else if (startTime && !endTime) {
    kibanaDate = `from:'${new Date(startTime).toISOString()}',to:now`;
  } else if (!startTime && endTime) {
    kibanaDate = `from:'${new Date(0).toISOString()}',to:'${new Date(endTime).toISOString()}'`;
  } else {
    kibanaDate = `from:'${new Date(0).toISOString()}',to:now`;
  }

  return kibanaDate;
};

const kibanaConfigured = (earthdatapubInstanceMeta) => {
  return !!earthdatapubInstanceMeta && !!earthdatapubInstanceMeta.stackName && !!_config.kibanaRoot;
};

export const kibanaS3AccessErrorsLink = (earthdatapubInstanceMeta, datepicker) => {
  if (!kibanaConfigured(earthdatapubInstanceMeta)) return '';
  const stackName = earthdatapubInstanceMeta.stackName;
  const timeInterval = formatKibanaDate(datepicker);
  return `${_config.kibanaRoot}/app/kibana#/discover?_g=(refreshInterval:(pause:!t,value:0),time:(${timeInterval}))&_a=(columns:!(response,key),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${stackName},key:_index,negate:!f,params:(query:'${stackName}-s3*',type:phrase),type:phrase,value:'${stackName}-s3*'),query:(match:(_index:(query:'${stackName}-s3*',type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${stackName},key:operation,negate:!f,params:(query:REST.GET.OBJECT,type:phrase),type:phrase,value:REST.GET.OBJECT),query:(match:(operation:(query:REST.GET.OBJECT,type:phrase))))),index:${stackName},interval:auto,query:(language:lucene,query:'NOT%20response:200'),sort:!('@timestamp',desc))`;
};

export const kibanaS3AccessSuccessesLink = (earthdatapubInstanceMeta, datepicker) => {
  if (!kibanaConfigured(earthdatapubInstanceMeta)) return '';
  const stackName = earthdatapubInstanceMeta.stackName;
  const timeInterval = formatKibanaDate(datepicker);
  return `${_config.kibanaRoot}/app/kibana#/discover?_g=(refreshInterval:(pause:!t,value:0),time:(${timeInterval}))&_a=(columns:!(response,key),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${stackName},key:_index,negate:!f,params:(query:'${stackName}-s3*',type:phrase),type:phrase,value:'${stackName}-s3*'),query:(match:(_index:(query:'${stackName}-s3*',type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${stackName},key:operation,negate:!f,params:(query:REST.GET.OBJECT,type:phrase),type:phrase,value:REST.GET.OBJECT),query:(match:(operation:(query:REST.GET.OBJECT,type:phrase))))),index:${stackName},interval:auto,query:(language:lucene,query:'response:200'),sort:!('@timestamp',desc))`;
};

export const kibanaTEALambdaErrorsLink = (earthdatapubInstanceMeta, datepicker) => {
  if (!kibanaConfigured(earthdatapubInstanceMeta)) return '';
  const stackName = earthdatapubInstanceMeta.stackName;
  const timeInterval = formatKibanaDate(datepicker);
  return `${_config.kibanaRoot}/app/kibana#/discover?_g=(refreshInterval:(pause:!t,value:0),time:(${timeInterval}))&_a=(columns:!(_source),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${stackName},key:_index,negate:!f,params:(query:'${stackName}-cloudwatch*',type:phrase),type:phrase,value:'${stackName}-cloudwatch*'),query:(match:(_index:(query:'${stackName}-cloudwatch*',type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${stackName},key:logGroup,negate:!f,params:(query:%2Faws%2Flambda%2F${stackName}-thin-egress-app-EgressLambda,type:phrase),type:phrase,value:%2Faws%2Flambda%2F${stackName}-thin-egress-app-EgressLambda),query:(match:(logGroup:(query:%2Faws%2Flambda%2F${stackName}-thin-egress-app-EgressLambda,type:phrase))))),index:${stackName},interval:auto,query:(language:lucene,query:'%22Could%20not%20download%22'),sort:!('@timestamp',desc))`;
};

export const kibanaTEALambdaSuccessesLink = (earthdatapubInstanceMeta, datepicker) => {
  if (!kibanaConfigured(earthdatapubInstanceMeta)) return '';
  const stackName = earthdatapubInstanceMeta.stackName;
  const timeInterval = formatKibanaDate(datepicker);
  return `${_config.kibanaRoot}/app/kibana#/discover?_g=(refreshInterval:(pause:!t,value:0),time:(${timeInterval}))&_a=(columns:!(_source),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${stackName},key:_index,negate:!f,params:(query:'${stackName}-cloudwatch*',type:phrase),type:phrase,value:'${stackName}-cloudwatch*'),query:(match:(_index:(query:'${stackName}-cloudwatch*',type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${stackName},key:logGroup,negate:!f,params:(query:%2Faws%2Flambda%2F${stackName}-thin-egress-app-EgressLambda,type:phrase),type:phrase,value:%2Faws%2Flambda%2F${stackName}-thin-egress-app-EgressLambda),query:(match:(logGroup:(query:%2Faws%2Flambda%2F${stackName}-thin-egress-app-EgressLambda,type:phrase))))),index:${stackName},interval:auto,query:(language:lucene,query:%22to_url%22),sort:!('@timestamp',desc))`;
};

export const kibanaApiLambdaErrorsLink = (earthdatapubInstanceMeta, datepicker) => {
  if (!kibanaConfigured(earthdatapubInstanceMeta)) return '';
  const stackName = earthdatapubInstanceMeta.stackName;
  const timeInterval = formatKibanaDate(datepicker);
  return `${_config.kibanaRoot}/app/kibana#/discover?_g=(refreshInterval:(pause:!t,value:0),time:(${timeInterval}))&_a=(columns:!(_source),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${stackName},key:_index,negate:!f,params:(query:'${stackName}-cloudwatch*',type:phrase),type:phrase,value:'${stackName}-cloudwatch*'),query:(match:(_index:(query:'${stackName}-cloudwatch*',type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${stackName},key:logGroup,negate:!f,params:(query:%2Faws%2Flambda%2F${stackName}-ApiDistribution,type:phrase),type:phrase,value:%2Faws%2Flambda%2F${stackName}-ApiDistribution),query:(match:(logGroup:(query:%2Faws%2Flambda%2F${stackName}-ApiDistribution,type:phrase))))),index:${stackName},interval:auto,query:(language:lucene,query:'message:(%2BGET%20%2BHTTP%20%20%2B(4%3F%3F%205%3F%3F)%20-(200%20307))'),sort:!('@timestamp',desc))`;
};

export const kibanaApiLambdaSuccessesLink = (earthdatapubInstanceMeta, datepicker) => {
  if (!kibanaConfigured(earthdatapubInstanceMeta)) return '';
  const stackName = earthdatapubInstanceMeta.stackName;
  const timeInterval = formatKibanaDate(datepicker);
  return `${_config.kibanaRoot}/app/kibana#/discover?_g=(refreshInterval:(pause:!t,value:0),time:(${timeInterval}))&_a=(columns:!(_source),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${stackName},key:_index,negate:!f,params:(query:'${stackName}-cloudwatch*',type:phrase),type:phrase,value:'${stackName}-cloudwatch*'),query:(match:(_index:(query:'${stackName}-cloudwatch*',type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${stackName},key:logGroup,negate:!f,params:(query:%2Faws%2Flambda%2F${stackName}-ApiDistribution,type:phrase),type:phrase,value:%2Faws%2Flambda%2F${stackName}-ApiDistribution),query:(match:(logGroup:(query:%2Faws%2Flambda%2F${stackName}-ApiDistribution,type:phrase))))),index:${stackName},interval:auto,query:(language:lucene,query:'message:(%2BGET%20%2BHTTP%20%2B(2%3F%3F%203%3F%3F))'),sort:!('@timestamp',desc))`;
};

export const kibanaGatewayExecutionErrorsLink = (earthdatapubInstanceMeta, datepicker) => {
  if (!kibanaConfigured(earthdatapubInstanceMeta)) return '';
  const stackName = earthdatapubInstanceMeta.stackName;
  const timeInterval = formatKibanaDate(datepicker);
  return `${_config.kibanaRoot}/app/kibana#/discover?_g=(refreshInterval:(pause:!t,value:0),time:(${timeInterval}))&_a=(columns:!(message),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${stackName},key:_index,negate:!f,params:(query:'${stackName}-cloudwatch*',type:phrase),type:phrase,value:'${stackName}-cloudwatch*'),query:(match:(_index:(query:'${stackName}-cloudwatch*',type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${stackName},key:logGroup,negate:!f,params:(query:'%22API%5C-Gateway%5C-Execution*%22',type:phrase),type:phrase,value:'%22API%5C-Gateway%5C-Execution*%22'),query:(match:(logGroup:(query:'%22API%5C-Gateway%5C-Execution*%22',type:phrase))))),index:${stackName},interval:auto,query:(language:lucene,query:'%2B%22Method%20completed%20with%20status:%22%20%2B(4%3F%3F%205%3F%3F)'),sort:!('@timestamp',desc))`;
};

export const kibanaGatewayExecutionSuccessesLink = (earthdatapubInstanceMeta, datepicker) => {
  if (!kibanaConfigured(earthdatapubInstanceMeta)) return '';
  const stackName = earthdatapubInstanceMeta.stackName;
  const timeInterval = formatKibanaDate(datepicker);
  const link = `${_config.kibanaRoot}/app/kibana#/discover?_g=(refreshInterval:(pause:!t,value:0),time:(${timeInterval}))&_a=(columns:!(message),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${stackName},key:_index,negate:!f,params:(query:'${stackName}-cloudwatch*',type:phrase),type:phrase,value:'${stackName}-cloudwatch*'),query:(match:(_index:(query:'${stackName}-cloudwatch*',type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${stackName},key:logGroup,negate:!f,params:(query:'%22API%5C-Gateway%5C-Execution*%22',type:phrase),type:phrase,value:'%22API%5C-Gateway%5C-Execution*%22'),query:(match:(logGroup:(query:'%22API%5C-Gateway%5C-Execution*%22',type:phrase))))),index:${stackName},interval:auto,query:(language:lucene,query:'%2B%22Method%20completed%20with%20status:%22%20%2B(2%3F%3F%203%3F%3F)'),sort:!('@timestamp',desc))`;
  return link;
};

export const kibanaGatewayAccessErrorsLink = (earthdatapubInstanceMeta, datepicker) => {
  if (!kibanaConfigured(earthdatapubInstanceMeta)) return '';
  const stackName = earthdatapubInstanceMeta.stackName;
  const timeInterval = formatKibanaDate(datepicker);
  return `${_config.kibanaRoot}/app/kibana#/discover?_g=(refreshInterval:(pause:!t,value:0),time:(${timeInterval}))&_a=(columns:!(message),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${stackName},key:_index,negate:!f,params:(query:'${stackName}-cloudwatch*',type:phrase),type:phrase,value:'${stackName}-cloudwatch*'),query:(match:(_index:(query:'${stackName}-cloudwatch*',type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${stackName},key:logGroup,negate:!f,params:(query:'%22API%5C-Gateway%5C-Execution*%22',type:phrase),type:phrase,value:'%22API%5C-Gateway%5C-Execution*%22'),query:(match:(logGroup:(query:'%22API%5C-Gateway%5C-Execution*%22',type:phrase))))),index:${stackName},interval:auto,query:(language:lucene,query:'status:%5B400%20TO%20599%5D'),sort:!('@timestamp',desc))`;
};

export const kibanaGatewayAccessSuccessesLink = (earthdatapubInstanceMeta, datepicker) => {
  if (!kibanaConfigured(earthdatapubInstanceMeta)) return '';
  const stackName = earthdatapubInstanceMeta.stackName;
  const timeInterval = formatKibanaDate(datepicker);
  return `${_config.kibanaRoot}/app/kibana#/discover?_g=(refreshInterval:(pause:!t,value:0),time:(${timeInterval}))&_a=(columns:!(message),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${stackName},key:_index,negate:!f,params:(query:'${stackName}-cloudwatch*',type:phrase),type:phrase,value:'${stackName}-cloudwatch*'),query:(match:(_index:(query:'${stackName}-cloudwatch*',type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${stackName},key:logGroup,negate:!f,params:(query:'%22API%5C-Gateway%5C-Execution*%22',type:phrase),type:phrase,value:'%22API%5C-Gateway%5C-Execution*%22'),query:(match:(logGroup:(query:'%22API%5C-Gateway%5C-Execution*%22',type:phrase))))),index:${stackName},interval:auto,query:(language:lucene,query:'status:%5B200%20TO%20399%5D'),sort:!('@timestamp',desc))`;
};

export const kibanaAllLogsLink = (earthdatapubInstanceMeta) => {
  if (!kibanaConfigured(earthdatapubInstanceMeta)) return '';
  const stackName = earthdatapubInstanceMeta.stackName;
  return `${_config.kibanaRoot}/app/kibana#/discover?_g=(refreshInterval:(pause:!t,value:0),time:(from:now-48h,to:now))&_a=(columns:!(_source),index:${stackName},interval:auto,query:(language:lucene,query:''),sort:!('@timestamp',desc))`;
};

export const kibanaExecutionLink = (earthdatapubInstanceMeta, executionName) => {
  if (!kibanaConfigured(earthdatapubInstanceMeta)) return '';
  const stackName = earthdatapubInstanceMeta.stackName;
  return `${_config.kibanaRoot}/app/kibana#/discover?_g=(refreshInterval:(pause:!t,value:0),time:(from:now-10y,to:now))&_a=(columns:!(_source),index:${stackName},interval:auto,query:(language:lucene,query:'executions:${executionName}'),sort:!('@timestamp',desc))`;
};
