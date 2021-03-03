// Authentication
export const LOGOUT = 'LOGOUT';
export const LOGIN = 'LOGIN';
export const LOGIN_INFLIGHT = 'LOGIN_INFLIGHT';
export const LOGIN_ERROR = 'LOGIN_ERROR';
export const FETCH_TOKEN = 'FETCH_TOKEN';
export const FETCH_TOKEN_INFLIGHT = 'FETCH_TOKEN_INFLIGHT';
export const FETCH_TOKEN_ERROR = 'FETCH_TOKEN_ERROR';
export const DELETE_TOKEN = 'DELETE_TOKEN';
export const SET_TOKEN = 'SET_TOKEN';
export const REFRESH_TOKEN = 'REFRESH_TOKEN';
export const REFRESH_TOKEN_ERROR = 'REFRESH_TOKEN_ERROR';
export const REFRESH_TOKEN_INFLIGHT = 'REFRESH_TOKEN_INFLIGHT';
export const ADD_INSTANCE_META = 'ADD_INSTANCE_META';
export const ADD_MMTLINK = 'ADD_MMTLINK';
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
// Workflows
export const WORKFLOWS = 'WORKFLOWS';
export const WORKFLOW = 'WORKFLOW';
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
// Roles
export const ROLE = 'ROLE';
export const ROLE_INFLIGHT = 'ROLE_INFLIGHT';
export const ROLE_ERROR = 'ROLE_ERROR';
export const ROLES = 'ROLES';
export const ROLES_INFLIGHT = 'ROLES_INFLIGHT';
export const ROLES_ERROR = 'ROLES_ERROR';
export const SEARCH_ROLES = 'SEARCH_ROLES';
export const CLEAR_ROLES_SEARCH = 'CLEAR_ROLES_SEARCH';
// Conversations
export const CONVERSATION = 'CONVERSATION';
export const CONVERSATION_INFLIGHT = 'CONVERSATION_INFLIGHT';
export const CONVERSATION_ERROR = 'CONVERSATION_ERROR';
export const CONVERSATIONS = 'CONVERSATIONS';
export const CONVERSATIONS_INFLIGHT = 'CONVERSATIONS_INFLIGHT';
export const CONVERSATIONS_ERROR = 'CONVERSATIONS_ERROR';
export const SEARCH_CONVERSATIONS = 'SEARCH_CONVERSATIONS';
export const CLEAR_CONVERSATIONS_SEARCH = 'CLEAR_CONVERSATIONS_SEARCH';
// Logs
export const LOGS = 'LOGS';
export const LOGS_INFLIGHT = 'LOGS_INFLIGHT';
export const LOGS_ERROR = 'LOGS_ERROR';
export const CLEAR_LOGS = 'CLEAR_LOGS';
export const SCHEMA = 'SCHEMA';
export const SCHEMA_INFLIGHT = 'SCHEMA_INFLIGHT';
export const SCHEMA_ERROR = 'SCHEMA_ERROR';
// Rules
export const RULES = 'RULES';
export const RULES_INFLIGHT = 'RULES_INFLIGHT';
export const RULES_ERROR = 'RULES_ERROR';
export const RULE = 'RULE';
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
export const PROCESSING_MODAL = 'PROCESSING_MODAL';
// Datepicker filtering
export const DATEPICKER_DROPDOWN_FILTER = 'DATEPICKER_DROPDOWN_FILTER';
export const DATEPICKER_DATECHANGE = 'DATEPICKER_DATECHANGE';
export const DATEPICKER_HOUR_FORMAT = 'DATEPICKER_HOUR_FORMAT';
// Requests
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
// Users
export const USER = 'USER';
export const USER_INFLIGHT = 'USER_INFLIGHT';
export const USER_ERROR = 'USER_ERROR';
export const USERS = 'USERS';
export const USERS_INFLIGHT = 'USERS_INFLIGHT';
export const USERS_ERROR = 'USERS_ERROR';
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
