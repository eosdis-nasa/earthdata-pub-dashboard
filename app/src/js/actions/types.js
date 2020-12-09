// Authentication
export const LOGOUT = 'LOGOUT';
export const LOGIN = 'LOGIN';
export const LOGIN_INFLIGHT = 'LOGIN_INFLIGHT';
export const LOGIN_ERROR = 'LOGIN_ERROR';
// Collections
export const ADD_INSTANCE_META = 'ADD_INSTANCE_META';
export const COLLECTION = 'COLLECTION';
export const COLLECTION_INFLIGHT = 'COLLECTION_INFLIGHT';
export const COLLECTION_ERROR = 'COLLECTION_ERROR';
export const COLLECTION_APPLYWORKFLOW = 'COLLECTION_APPLYWORKFLOW';
export const COLLECTION_APPLYWORKFLOW_INFLIGHT = 'COLLECTION_APPLYWORKFLOW_INFLIGHT';
export const COLLECTION_APPLYWORKFLOW_ERROR = 'COLLECTION_APPLYWORKFLOW_ERROR';
export const COLLECTIONS = 'COLLECTIONS';
export const COLLECTIONS_INFLIGHT = 'COLLECTIONS_INFLIGHT';
export const COLLECTIONS_ERROR = 'COLLECTIONS_ERROR';
export const NEW_COLLECTION = 'NEW_COLLECTION';
export const NEW_COLLECTION_INFLIGHT = 'NEW_COLLECTION_INFLIGHT';
export const NEW_COLLECTION_ERROR = 'NEW_COLLECTION_ERROR';
export const UPDATE_COLLECTION = 'UPDATE_COLLECTION';
export const UPDATE_COLLECTION_INFLIGHT = 'UPDATE_COLLECTION_INFLIGHT';
export const UPDATE_COLLECTION_ERROR = 'UPDATE_COLLECTION_ERROR';
export const UPDATE_COLLECTION_CLEAR = 'UPDATE_COLLECTION_CLEAR';
export const SEARCH_COLLECTIONS = 'SEARCH_COLLECTIONS';
export const CLEAR_COLLECTIONS_SEARCH = 'CLEAR_COLLECTIONS_SEARCH';
export const FILTER_COLLECTIONS = 'FILTER_COLLECTIONS';
export const CLEAR_COLLECTIONS_FILTER = 'CLEAR_COLLECTIONS_FILTER';
export const COLLECTION_DELETE = 'COLLECTION_DELETE';
export const COLLECTION_DELETE_INFLIGHT = 'COLLECTION_DELETE_INFLIGHT';
export const COLLECTION_DELETE_ERROR = 'COLLECTION_DELETE_ERROR';
export const ADD_MMTLINK = 'ADD_MMTLINK';
// Granules
export const GRANULE = 'GRANULE';
export const GRANULE_INFLIGHT = 'GRANULE_INFLIGHT';
export const GRANULE_ERROR = 'GRANULE_ERROR';
export const GRANULES = 'GRANULES';
export const GRANULES_INFLIGHT = 'GRANULES_INFLIGHT';
export const GRANULES_ERROR = 'GRANULES_ERROR';
export const GRANULE_APPLYWORKFLOW = 'GRANULE_APPLYWORKFLOW';
export const GRANULE_APPLYWORKFLOW_INFLIGHT = 'GRANULE_APPLYWORKFLOW_INFLIGHT';
export const GRANULE_APPLYWORKFLOW_ERROR = 'GRANULE_APPLYWORKFLOW_ERROR';
export const GRANULE_REPROCESS = 'GRANULE_REPROCESS';
export const GRANULE_REPROCESS_INFLIGHT = 'GRANULE_REPROCESS_INFLIGHT';
export const GRANULE_REPROCESS_ERROR = 'GRANULE_REPROCESS_ERROR';
export const GRANULE_REINGEST = 'GRANULE_REINGEST';
export const GRANULE_REINGEST_INFLIGHT = 'GRANULE_REINGEST_INFLIGHT';
export const GRANULE_REINGEST_ERROR = 'GRANULE_REINGEST_ERROR';
export const GRANULE_REMOVE = 'GRANULE_REMOVE';
export const GRANULE_REMOVE_INFLIGHT = 'GRANULE_REMOVE_INFLIGHT';
export const GRANULE_REMOVE_ERROR = 'GRANULE_REMOVE_ERROR';
export const GRANULE_RECOVER = 'GRANULE_RECOVER';
export const GRANULE_RECOVER_INFLIGHT = 'GRANULE_RECOVER_INFLIGHT';
export const GRANULE_RECOVER_ERROR = 'GRANULE_RECOVER_ERROR';
export const BULK_GRANULE = 'BULK_GRANULE';
export const BULK_GRANULE_INFLIGHT = 'BULK_GRANULE_INFLIGHT';
export const BULK_GRANULE_ERROR = 'BULK_GRANULE_ERROR';
export const GRANULE_DELETE = 'GRANULE_DELETE';
export const GRANULE_DELETE_INFLIGHT = 'GRANULE_DELETE_INFLIGHT';
export const GRANULE_DELETE_ERROR = 'GRANULE_DELETE_ERROR';
export const GRANULE_CSV = 'GRANULE_CSV';
export const GRANULE_CSV_INFLIGHT = 'GRANULE_CSV_INFLIGHT';
export const GRANULE_CSV_ERROR = 'GRANULE_CSV_ERROR';
export const SEARCH_GRANULES = 'SEARCH_GRANULES';
export const CLEAR_GRANULES_SEARCH = 'CLEAR_GRANULES_SEARCH';
export const FILTER_GRANULES = 'FILTER_GRANULES';
export const CLEAR_GRANULES_FILTER = 'CLEAR_GRANULES_FILTER';
export const OPTIONS_COLLECTIONNAME = 'OPTIONS_COLLECTIONNAME';
export const OPTIONS_COLLECTIONNAME_INFLIGHT = 'OPTIONS_COLLECTIONNAME_INFLIGHT';
export const OPTIONS_COLLECTIONNAME_ERROR = 'OPTIONS_COLLECTIONNAME_ERROR';
// Stats
export const STATS = 'STATS';
export const STATS_INFLIGHT = 'STATS_INFLIGHT';
export const STATS_ERROR = 'STATS_ERROR';
// AWS
export const DIST_APIGATEWAY = 'DIST_APIGATEWAY';
export const DIST_APIGATEWAY_INFLIGHT = 'DIST_APIGATEWAY_INFLIGHT';
export const DIST_APIGATEWAY_ERROR = 'DIST_APIGATEWAY_ERROR';
export const DIST_API_LAMBDA = 'DIST_API_LAMBDA';
export const DIST_API_LAMBDA_INFLIGHT = 'DIST_API_LAMBDA_INFLIGHT';
export const DIST_API_LAMBDA_ERROR = 'DIST_API_LAMBDA_ERROR';
export const DIST_TEA_LAMBDA = 'DIST_TEA_LAMBDA';
export const DIST_TEA_LAMBDA_INFLIGHT = 'DIST_TEA_LAMBDA_INFLIGHT';
export const DIST_TEA_LAMBDA_ERROR = 'DIST_TEA_LAMBDA_ERROR';
export const DIST_S3ACCESS = 'DIST_S3ACCESS';
export const DIST_S3ACCESS_INFLIGHT = 'DIST_S3ACCESS_INFLIGHT';
export const DIST_S3ACCESS_ERROR = 'DIST_S3ACCESS_ERROR';
// Count
export const COUNT = 'COUNT';
export const COUNT_INFLIGHT = 'COUNT_INFLIGHT';
export const COUNT_ERROR = 'COUNT_ERROR';
// PDR
export const PDR = 'PDR';
export const PDR_INFLIGHT = 'PDR_INFLIGHT';
export const PDR_ERROR = 'PDR_ERROR';
export const PDRS = 'PDRS';
export const PDRS_INFLIGHT = 'PDRS_INFLIGHT';
export const PDRS_ERROR = 'PDRS_ERROR';
export const PDR_DELETE = 'PDR_DELETE';
export const PDR_DELETE_INFLIGHT = 'PDR_DELETE_INFLIGHT';
export const PDR_DELETE_ERROR = 'PDR_DELETE_ERROR';
export const SEARCH_PDRS = 'SEARCH_PDRS';
export const CLEAR_PDRS_SEARCH = 'CLEAR_PDRS_SEARCH';
export const FILTER_PDRS = 'FILTER_PDRS';
export const CLEAR_PDRS_FILTER = 'CLEAR_PDRS_FILTER';
// Providers
export const PROVIDER = 'PROVIDER';
export const PROVIDER_INFLIGHT = 'PROVIDER_INFLIGHT';
export const PROVIDER_ERROR = 'PROVIDER_ERROR';
export const PROVIDER_COLLECTIONS = 'PROVIDER_COLLECTIONS';
export const PROVIDER_COLLECTIONS_INFLIGHT = 'PROVIDER_COLLECTIONS_INFLIGHT';
export const PROVIDER_COLLECTIONS_ERROR = 'PROVIDER_COLLECTIONS_ERROR';
export const NEW_PROVIDER = 'NEW_PROVIDER';
export const NEW_PROVIDER_INFLIGHT = 'NEW_PROVIDER_INFLIGHT';
export const NEW_PROVIDER_ERROR = 'NEW_PROVIDER_ERROR';
export const UPDATE_PROVIDER = 'UPDATE_PROVIDER';
export const UPDATE_PROVIDER_INFLIGHT = 'UPDATE_PROVIDER_INFLIGHT';
export const UPDATE_PROVIDER_ERROR = 'UPDATE_PROVIDER_ERROR';
export const UPDATE_PROVIDER_CLEAR = 'UPDATE_PROVIDER_CLEAR';
export const PROVIDERS = 'PROVIDERS';
export const PROVIDERS_INFLIGHT = 'PROVIDERS_INFLIGHT';
export const PROVIDERS_ERROR = 'PROVIDERS_ERROR';
export const PROVIDER_DELETE = 'PROVIDER_DELETE';
export const PROVIDER_DELETE_INFLIGHT = 'PROVIDER_DELETE_INFLIGHT';
export const PROVIDER_DELETE_ERROR = 'PROVIDER_DELETE_ERROR';
export const PROVIDER_RESTART = 'PROVIDER_RESTART';
export const PROVIDER_RESTART_INFLIGHT = 'PROVIDER_RESTART_INFLIGHT';
export const PROVIDER_RESTART_ERROR = 'PROVIDER_RESTART_ERROR';
export const CLEAR_RESTARTED_PROVIDER = 'CLEAR_RESTARTED_PROVIDER';
export const PROVIDER_STOP = 'PROVIDER_STOP';
export const PROVIDER_STOP_INFLIGHT = 'PROVIDER_STOP_INFLIGHT';
export const PROVIDER_STOP_ERROR = 'PROVIDER_STOP_ERROR';
export const CLEAR_STOPPED_PROVIDER = 'CLEAR_STOPPED_PROVIDER';
export const OPTIONS_PROVIDERGROUP = 'OPTIONS_PROVIDERGROUP';
export const OPTIONS_PROVIDERGROUP_INFLIGHT = 'OPTIONS_PROVIDERGROUP_INFLIGHT';
export const OPTIONS_PROVIDERGROUP_ERROR = 'OPTIONS_PROVIDERGROUP_ERROR';
export const SEARCH_PROVIDERS = 'SEARCH_PROVIDERS';
export const CLEAR_PROVIDERS_SEARCH = 'CLEAR_PROVIDERS_SEARCH';
export const FILTER_PROVIDERS = 'FILTER_PROVIDERS';
export const CLEAR_PROVIDERS_FILTER = 'CLEAR_PROVIDERS_FILTER';
// Workflows
export const WORKFLOWS = 'WORKFLOWS';
export const WORKFLOWS_INFLIGHT = 'WORKFLOWS_INFLIGHT';
export const WORKFLOWS_ERROR = 'WORKFLOWS_ERROR';
export const SEARCH_WORKFLOWS = 'SEARCH_WORKFLOWS';
export const CLEAR_WORKFLOWS_SEARCH = 'CLEAR_WORKFLOWS_SEARCH';
// Metrics
export const METRICS = 'METRICS';
export const METRICS_INFLIGHT = 'METRICS_INFLIGHT';
export const METRICS_ERROR = 'METRICS_ERROR';
export const SEARCH_METRICS = 'SEARCH_METRICS';
export const CLEAR_METRICS_SEARCH = 'CLEAR_METRICS_SEARCH';
// Logs
export const LOGS = 'LOGS';
export const LOGS_INFLIGHT = 'LOGS_INFLIGHT';
export const LOGS_ERROR = 'LOGS_ERROR';
export const CLEAR_LOGS = 'CLEAR_LOGS';
export const SCHEMA = 'SCHEMA';
export const SCHEMA_INFLIGHT = 'SCHEMA_INFLIGHT';
export const SCHEMA_ERROR = 'SCHEMA_ERROR';
// Executions
export const EXECUTION_STATUS = 'EXECUTION_STATUS';
export const EXECUTION_STATUS_INFLIGHT = 'EXECUTION_STATUS_INFLIGHT';
export const EXECUTION_STATUS_ERROR = 'EXECUTION_STATUS_ERROR';
export const EXECUTION_LOGS = 'EXECUTION_LOGS';
export const EXECUTION_LOGS_INFLIGHT = 'EXECUTION_LOGS_INFLIGHT';
export const EXECUTION_LOGS_ERROR = 'EXECUTION_LOGS_ERROR';
export const EXECUTIONS = 'EXECUTIONS';
export const EXECUTIONS_INFLIGHT = 'EXECUTIONS_INFLIGHT';
export const EXECUTIONS_ERROR = 'EXECUTIONS_ERROR';
export const FILTER_EXECUTIONS = 'FILTER_EXECUTIONS';
export const CLEAR_EXECUTIONS_FILTER = 'CLEAR_EXECUTIONS_FILTER';
export const SEARCH_EXECUTIONS = 'SEARCH_EXECUTIONS';
export const CLEAR_EXECUTIONS_SEARCH = 'CLEAR_EXECUTIONS_SEARCH';
export const SEARCH_EXECUTION_EVENTS = 'SEARCH_EXECUTION_EVENTS';
export const CLEAR_EXECUTION_EVENTS_SEARCH = 'CLEAR_EXECUTION_EVENTS_SEARCH';

// Operations
export const OPERATIONS = 'OPERATIONS';
export const OPERATIONS_INFLIGHT = 'OPERATIONS_INFLIGHT';
export const OPERATIONS_ERROR = 'OPERATIONS_ERROR';
export const OPERATION = 'OPERATION';
export const OPERATION_INFLIGHT = 'OPERATION_INFLIGHT';
export const OPERATION_ERROR = 'OPERATION_ERROR';
export const SEARCH_OPERATIONS = 'SEARCH_OPERATIONS';
export const CLEAR_OPERATIONS_SEARCH = 'CLEAR_OPERATIONS_SEARCH';
export const FILTER_OPERATIONS = 'FILTER_OPERATIONS';
export const CLEAR_OPERATIONS_FILTER = 'CLEAR_OPERATIONS_FILTER';
// Rules
export const RULES = 'RULES';
export const RULES_INFLIGHT = 'RULES_INFLIGHT';
export const RULES_ERROR = 'RULES_ERROR';
export const RULE = 'RULE';
export const RULE_INFLIGHT = 'RULE_INFLIGHT';
export const RULE_ERROR = 'RULE_ERROR';
export const UPDATE_RULE = 'UPDATE_RULE';
export const UPDATE_RULE_INFLIGHT = 'UPDATE_RULE_INFLIGHT';
export const UPDATE_RULE_ERROR = 'UPDATE_RULE_ERROR';
export const UPDATE_RULE_CLEAR = 'UPDATE_RULE_CLEAR';
export const NEW_RULE = 'NEW_RULE';
export const NEW_RULE_INFLIGHT = 'NEW_RULE_INFLIGHT';
export const NEW_RULE_ERROR = 'NEW_RULE_ERROR';
export const RULE_DELETE = 'RULE_DELETE';
export const RULE_DELETE_INFLIGHT = 'RULE_DELETE_INFLIGHT';
export const RULE_DELETE_ERROR = 'RULE_DELETE_ERROR';
export const RULE_RERUN = 'RULE_RERUN';
export const RULE_RERUN_INFLIGHT = 'RULE_RERUN_INFLIGHT';
export const RULE_RERUN_ERROR = 'RULE_RERUN_ERROR';
export const RULE_ENABLE = 'RULE_ENABLE';
export const RULE_ENABLE_INFLIGHT = 'RULE_ENABLE_INFLIGHT';
export const RULE_ENABLE_ERROR = 'RULE_ENABLE_ERROR';
export const RULE_DISABLE = 'RULE_DISABLE';
export const RULE_DISABLE_INFLIGHT = 'RULE_DISABLE_INFLIGHT';
export const RULE_DISABLE_ERROR = 'RULE_DISABLE_ERROR';
export const SEARCH_RULES = 'SEARCH_RULES';
export const CLEAR_RULES_SEARCH = 'CLEAR_RULES_SEARCH';
export const FILTER_RULES = 'FILTER_RULES';
export const CLEAR_RULES_FILTER = 'CLEAR_RULES_FILTER';
// Reports
export const RECONCILIATION = 'RECONCILIATION';
export const RECONCILIATION_INFLIGHT = 'RECONCILIATION_INFLIGHT';
export const RECONCILIATION_ERROR = 'RECONCILIATION_ERROR';
export const RECONCILIATIONS = 'RECONCILIATIONS';
export const RECONCILIATIONS_INFLIGHT = 'RECONCILIATIONS_INFLIGHT';
export const RECONCILIATIONS_ERROR = 'RECONCILIATIONS_ERROR';
export const SEARCH_RECONCILIATIONS = 'SEARCH_RECONCILIATIONS';
export const CLEAR_RECONCILIATIONS_SEARCH = 'CLEAR_RECONCILIATIONS_SEARCH';
export const NEW_RECONCILIATION = 'NEW_RECONCILIATION';
export const NEW_RECONCILIATION_INFLIGHT = 'NEW_RECONCILIATION_INFLIGHT';
export const NEW_RECONCILIATION_ERROR = 'NEW_RECONCILIATION_ERROR';
// Tokens
export const DELETE_TOKEN = 'DELETE_TOKEN';
export const REFRESH_TOKEN = 'REFRESH_TOKEN';
export const REFRESH_TOKEN_ERROR = 'REFRESH_TOKEN_ERROR';
export const REFRESH_TOKEN_INFLIGHT = 'REFRESH_TOKEN_INFLIGHT';
export const SET_TOKEN = 'SET_TOKEN';
// API
export const API_VERSION = 'API_VERSION';
export const API_VERSION_ERROR = 'API_VERSION_ERROR';
export const API_VERSION_COMPATIBLE = 'API_VERSION_COMPATIBLE';
export const API_VERSION_INCOMPATIBLE = 'API_VERSION_INCOMPATIBLE';
export const NOOP = 'NOOP';
export const CALL_API = 'CALL_API';
// Modals
export const ASYNC_COMMAND = 'ASYNC_COMMAND';
export const BATCH_ASYNC_COMMAND = 'BATCH_ASYNC_COMMAND';
export const COLLECTION_DELETED_CONFIRM_MODAL = 'COLLECTION_DELETED_CONFIRM_MODAL';
export const DELETE_COLLECTION_MODAL = 'DELETE_COLLECTION_MODAL';
export const GRANULES_REDIRECT_MODAL = 'GRANULES_REDIRECT_MODAL';
export const PROCESSING_MODAL = 'PROCESSING_MODAL';
// Datepicker filtering
export const DATEPICKER_DROPDOWN_FILTER = 'DATEPICKER_DROPDOWN_FILTER';
export const DATEPICKER_DATECHANGE = 'DATEPICKER_DATECHANGE';
export const DATEPICKER_HOUR_FORMAT = 'DATEPICKER_HOUR_FORMAT';

// Submissions
export const SUBMISSION = 'SUBMISSION';
export const SUBMISSION_INFLIGHT = 'SUBMISSION_INFLIGHT';
export const SUBMISSION_ERROR = 'SUBMISSION_ERROR';
export const SUBMISSIONS = 'SUBMISSIONS';
export const SUBMISSIONS_INFLIGHT = 'SUBMISSIONS_INFLIGHT';
export const SUBMISSIONS_ERROR = 'SUBMISSIONS_ERROR';
export const SUBMISSION_APPLYWORKFLOW = 'SUBMISSION_APPLYWORKFLOW';
export const SUBMISSION_APPLYWORKFLOW_INFLIGHT = 'SUBMISSION_APPLYWORKFLOW_INFLIGHT';
export const SUBMISSION_APPLYWORKFLOW_ERROR = 'SUBMISSION_APPLYWORKFLOW_ERROR';
export const SUBMISSION_REPROCESS = 'SUBMISSION_REPROCESS';
export const SUBMISSION_REPROCESS_INFLIGHT = 'SUBMISSION_REPROCESS_INFLIGHT';
export const SUBMISSION_REPROCESS_ERROR = 'SUBMISSION_REPROCESS_ERROR';
export const SUBMISSION_REINGEST = 'SUBMISSION_REINGEST';
export const SUBMISSION_REINGEST_INFLIGHT = 'SUBMISSION_REINGEST_INFLIGHT';
export const SUBMISSION_REINGEST_ERROR = 'SUBMISSION_REINGEST_ERROR';
export const SUBMISSION_REMOVE = 'SUBMISSION_REMOVE';
export const SUBMISSION_REMOVE_INFLIGHT = 'SUBMISSION_REMOVE_INFLIGHT';
export const SUBMISSION_REMOVE_ERROR = 'SUBMISSION_REMOVE_ERROR';
export const SUBMISSION_RECOVER = 'SUBMISSION_RECOVER';
export const SUBMISSION_RECOVER_INFLIGHT = 'SUBMISSION_RECOVER_INFLIGHT';
export const SUBMISSION_RECOVER_ERROR = 'SUBMISSION_RECOVER_ERROR';
export const SUBMISSION_UPDATE_METADATA = 'SUBMISSION_UPDATE_METADATA';
export const SUBMISSION_UPDATE_METADATA_INFLIGHT = 'SUBMISSION_UPDATE_METADATA_INFLIGHT';
export const BULK_SUBMISSION = 'BULK_SUBMISSION';
export const BULK_SUBMISSION_INFLIGHT = 'BULK_SUBMISSION_INFLIGHT';
export const BULK_SUBMISSION_ERROR = 'BULK_SUBMISSION_ERROR';
export const SUBMISSION_DELETE = 'SUBMISSION_DELETE';
export const SUBMISSION_DELETE_INFLIGHT = 'SUBMISSION_DELETE_INFLIGHT';
export const SUBMISSION_DELETE_ERROR = 'SUBMISSION_DELETE_ERROR';
export const SUBMISSION_CSV = 'SUBMISSION_CSV';
export const SUBMISSION_CSV_INFLIGHT = 'SUBMISSION_CSV_INFLIGHT';
export const SUBMISSION_CSV_ERROR = 'SUBMISSION_CSV_ERROR';
export const SEARCH_SUBMISSIONS = 'SEARCH_SUBMISSIONS';
export const CLEAR_SUBMISSIONS_SEARCH = 'CLEAR_SUBMISSIONS_SEARCH';
export const FILTER_SUBMISSIONS = 'FILTER_SUBMISSIONS';
export const CLEAR_SUBMISSIONS_FILTER = 'CLEAR_SUBMISSIONS_FILTER';
export const OPTIONS_SUBMISSIONNAME = 'OPTIONS_SUBMISSIONNAME';
export const OPTIONS_SUBMISSIONNAME_INFLIGHT = 'OPTIONS_SUBMISSIONNAME_INFLIGHT';
export const OPTIONS_SUBMISSIONNAME_ERROR = 'OPTIONS_SUBMISSIONNAME_ERROR';

export const FILTER_STAGES = 'FILTER_STAGES';
export const CLEAR_STAGES_FILTER = 'CLEAR_STAGES_FILTER';

export const FILTER_STATUSES = 'FILTER_STATUSES';
export const CLEAR_STATUSES_FILTER = 'CLEAR_STATUSES_FILTER';

// Groups
export const GROUP = 'GROUP';
export const GROUP_INFLIGHT = 'GROUP_INFLIGHT';
export const GROUP_ERROR = 'GROUP_ERROR';
export const GROUP_COLLECTIONS = 'GROUP_COLLECTIONS';
export const GROUP_COLLECTIONS_INFLIGHT = 'GROUP_COLLECTIONS_INFLIGHT';
export const GROUP_COLLECTIONS_ERROR = 'GROUP_COLLECTIONS_ERROR';
export const NEW_GROUP = 'NEW_GROUP';
export const NEW_GROUP_INFLIGHT = 'NEW_GROUP_INFLIGHT';
export const NEW_GROUP_ERROR = 'NEW_GROUP_ERROR';
export const UPDATE_GROUP = 'UPDATE_GROUP';
export const UPDATE_GROUP_INFLIGHT = 'UPDATE_GROUP_INFLIGHT';
export const UPDATE_GROUP_ERROR = 'UPDATE_GROUP_ERROR';
export const UPDATE_GROUP_CLEAR = 'UPDATE_GROUP_CLEAR';
export const GROUPS = 'GROUPS';
export const GROUPS_INFLIGHT = 'GROUPS_INFLIGHT';
export const GROUPS_ERROR = 'GROUPS_ERROR';
export const GROUP_DELETE = 'GROUP_DELETE';
export const GROUP_DELETE_INFLIGHT = 'GROUP_DELETE_INFLIGHT';
export const GROUP_DELETE_ERROR = 'GROUP_DELETE_ERROR';
export const GROUP_RESTART = 'GROUP_RESTART';
export const GROUP_RESTART_INFLIGHT = 'GROUP_RESTART_INFLIGHT';
export const GROUP_RESTART_ERROR = 'GROUP_RESTART_ERROR';
export const CLEAR_RESTARTED_GROUP = 'CLEAR_RESTARTED_GROUP';
export const GROUP_STOP = 'GROUP_STOP';
export const GROUP_STOP_INFLIGHT = 'GROUP_STOP_INFLIGHT';
export const GROUP_STOP_ERROR = 'GROUP_STOP_ERROR';
export const CLEAR_STOPPED_GROUP = 'CLEAR_STOPPED_GROUP';
export const OPTIONS_GROUPGROUP = 'OPTIONS_GROUPGROUP';
export const OPTIONS_GROUPGROUP_INFLIGHT = 'OPTIONS_GROUPGROUP_INFLIGHT';
export const OPTIONS_GROUPGROUP_ERROR = 'OPTIONS_GROUPGROUP_ERROR';
export const SEARCH_GROUPS = 'SEARCH_GROUPS';
export const CLEAR_GROUPS_SEARCH = 'CLEAR_GROUPS_SEARCH';
export const FILTER_GROUPS = 'FILTER_GROUPS';
export const CLEAR_GROUPS_FILTER = 'CLEAR_GROUPS_FILTER';

//Roles
export const ROLE = 'ROLE';
export const ROLE_INFLIGHT = 'ROLE_INFLIGHT';
export const ROLE_ERROR = 'ROLE_ERROR';
export const ROLE_COLLECTIONS = 'ROLE_COLLECTIONS';
export const ROLE_COLLECTIONS_INFLIGHT = 'ROLE_COLLECTIONS_INFLIGHT';
export const ROLE_COLLECTIONS_ERROR = 'ROLE_COLLECTIONS_ERROR';
export const NEW_ROLE = 'NEW_ROLE';
export const NEW_ROLE_INFLIGHT = 'NEW_ROLE_INFLIGHT';
export const NEW_ROLE_ERROR = 'NEW_ROLE_ERROR';
export const UPDATE_ROLE = 'UPDATE_ROLE';
export const UPDATE_ROLE_INFLIGHT = 'UPDATE_ROLE_INFLIGHT';
export const UPDATE_ROLE_ERROR = 'UPDATE_ROLE_ERROR';
export const UPDATE_ROLE_CLEAR = 'UPDATE_ROLE_CLEAR';
export const ROLES = 'ROLES';
export const ROLES_INFLIGHT = 'ROLES_INFLIGHT';
export const ROLES_ERROR = 'ROLES_ERROR';
export const ROLE_DELETE = 'ROLE_DELETE';
export const ROLE_DELETE_INFLIGHT = 'ROLE_DELETE_INFLIGHT';
export const ROLE_DELETE_ERROR = 'ROLE_DELETE_ERROR';
export const ROLE_RESTART = 'ROLE_RESTART';
export const ROLE_RESTART_INFLIGHT = 'ROLE_RESTART_INFLIGHT';
export const ROLE_RESTART_ERROR = 'ROLE_RESTART_ERROR';
export const CLEAR_RESTARTED_ROLE = 'CLEAR_RESTARTED_ROLE';
export const ROLE_STOP = 'ROLE_STOP';
export const ROLE_STOP_INFLIGHT = 'ROLE_STOP_INFLIGHT';
export const ROLE_STOP_ERROR = 'ROLE_STOP_ERROR';
export const CLEAR_STOPPED_ROLE = 'CLEAR_STOPPED_ROLE';
export const OPTIONS_ROLEGROUP = 'OPTIONS_ROLEGROUP';
export const OPTIONS_ROLEGROUP_INFLIGHT = 'OPTIONS_ROLEGROUP_INFLIGHT';
export const OPTIONS_ROLEGROUP_ERROR = 'OPTIONS_ROLEGROUP_ERROR';
export const SEARCH_ROLES = 'SEARCH_ROLES';
export const CLEAR_ROLES_SEARCH = 'CLEAR_ROLES_SEARCH';
export const FILTER_ROLES = 'FILTER_ROLES';
export const CLEAR_ROLES_FILTER = 'CLEAR_ROLES_FILTER';


// Users
export const USER = 'USER';
export const USER_INFLIGHT = 'USER_INFLIGHT';
export const USER_ERROR = 'USER_ERROR';
export const USER_COLLECTIONS = 'USER_COLLECTIONS';
export const USER_COLLECTIONS_INFLIGHT = 'USER_COLLECTIONS_INFLIGHT';
export const USER_COLLECTIONS_ERROR = 'USER_COLLECTIONS_ERROR';
export const NEW_USER = 'NEW_USER';
export const NEW_USER_INFLIGHT = 'NEW_USER_INFLIGHT';
export const NEW_USER_ERROR = 'NEW_USER_ERROR';
export const UPDATE_USER = 'UPDATE_USER';
export const UPDATE_USER_INFLIGHT = 'UPDATE_USER_INFLIGHT';
export const UPDATE_USER_ERROR = 'UPDATE_USER_ERROR';
export const UPDATE_USER_CLEAR = 'UPDATE_USER_CLEAR';
export const USERS = 'USERS';
export const USERS_INFLIGHT = 'USERS_INFLIGHT';
export const USERS_ERROR = 'USERS_ERROR';
export const USER_DELETE = 'USER_DELETE';
export const USER_DELETE_INFLIGHT = 'USER_DELETE_INFLIGHT';
export const USER_DELETE_ERROR = 'USER_DELETE_ERROR';
export const USER_RESTART = 'USER_RESTART';
export const USER_RESTART_INFLIGHT = 'USER_RESTART_INFLIGHT';
export const USER_RESTART_ERROR = 'USER_RESTART_ERROR';
export const CLEAR_RESTARTED_USER = 'CLEAR_RESTARTED_USER';
export const USER_STOP = 'USER_STOP';
export const USER_STOP_INFLIGHT = 'USER_STOP_INFLIGHT';
export const USER_STOP_ERROR = 'USER_STOP_ERROR';
export const CLEAR_STOPPED_USER = 'CLEAR_STOPPED_USER';
export const OPTIONS_USERGROUP = 'OPTIONS_USERGROUP';
export const OPTIONS_USERGROUP_INFLIGHT = 'OPTIONS_USERGROUP_INFLIGHT';
export const OPTIONS_USERGROUP_ERROR = 'OPTIONS_USERGROUP_ERROR';
export const SEARCH_USERS = 'SEARCH_USERS';
export const CLEAR_USERS_SEARCH = 'CLEAR_USERS_SEARCH';
export const FILTER_USERS = 'FILTER_USERS';
export const CLEAR_USERS_FILTER = 'CLEAR_USERS_FILTER';

// Forms
export const FORM = 'FORM';
export const FORM_INFLIGHT = 'FORM_INFLIGHT';
export const FORM_ERROR = 'FORM_ERROR';
export const FORM_COLLECTIONS = 'FORM_COLLECTIONS';
export const FORM_COLLECTIONS_INFLIGHT = 'FORM_COLLECTIONS_INFLIGHT';
export const FORM_COLLECTIONS_ERROR = 'FORM_COLLECTIONS_ERROR';
export const NEW_FORM = 'NEW_FORM';
export const NEW_FORM_INFLIGHT = 'NEW_FORM_INFLIGHT';
export const NEW_FORM_ERROR = 'NEW_FORM_ERROR';
export const UPDATE_FORM = 'UPDATE_FORM';
export const UPDATE_FORM_INFLIGHT = 'UPDATE_FORM_INFLIGHT';
export const UPDATE_FORM_ERROR = 'UPDATE_FORM_ERROR';
export const UPDATE_FORM_CLEAR = 'UPDATE_FORM_CLEAR';
export const FORMS = 'FORMS';
export const FORMS_INFLIGHT = 'FORMS_INFLIGHT';
export const FORMS_ERROR = 'FORMS_ERROR';
export const FORM_DELETE = 'FORM_DELETE';
export const FORM_DELETE_INFLIGHT = 'FORM_DELETE_INFLIGHT';
export const FORM_DELETE_ERROR = 'FORM_DELETE_ERROR';
export const FORM_RESTART = 'FORM_RESTART';
export const FORM_RESTART_INFLIGHT = 'FORM_RESTART_INFLIGHT';
export const FORM_RESTART_ERROR = 'FORM_RESTART_ERROR';
export const CLEAR_RESTARTED_FORM = 'CLEAR_RESTARTED_FORM';
export const FORM_STOP = 'FORM_STOP';
export const FORM_STOP_INFLIGHT = 'FORM_STOP_INFLIGHT';
export const FORM_STOP_ERROR = 'FORM_STOP_ERROR';
export const CLEAR_STOPPED_FORM = 'CLEAR_STOPPED_FORM';
export const OPTIONS_FORMGROUP = 'OPTIONS_FORMGROUP';
export const OPTIONS_FORMGROUP_INFLIGHT = 'OPTIONS_FORMGROUP_INFLIGHT';
export const OPTIONS_FORMGROUP_ERROR = 'OPTIONS_FORMGROUP_ERROR';
export const SEARCH_FORMS = 'SEARCH_FORMS';
export const CLEAR_FORMS_SEARCH = 'CLEAR_FORMS_SEARCH';
export const FILTER_FORMS = 'FILTER_FORMS';
export const CLEAR_FORMS_FILTER = 'CLEAR_FORMS_FILTER';

// Questions
export const QUESTION = 'QUESTION';
export const QUESTION_INFLIGHT = 'QUESTION_INFLIGHT';
export const QUESTIONS = 'QUESTIONS';
export const QUESTIONS_INFLIGHT = 'QUESTIONS_INFLIGHT';
export const QUESTIONS_ERROR = 'QUESTIONS_ERROR';
export const SEARCH_QUESTIONS = 'SEARCH_QUESTIONS';
export const CLEAR_QUESTIONS_SEARCH = 'CLEAR_QUESTIONS_SEARCH';
export const FILTER_QUESTIONS = 'FILTER_QUESTIONS';
export const CLEAR_QUESTIONS_FILTER = 'CLEAR_QUESTIONS_FILTER';

// Model
export const MODEL = 'MODEL';
export const MODEL_INFLIGHT = 'MODEL_INFLIGHT';
