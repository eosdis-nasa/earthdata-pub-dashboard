const { defineConfig } = require('cypress');

module.exports = defineConfig({
  viewportWidth: 1300,
  viewportHeight: 1000,

  env: {
    baseUrl: 'http://localhost:3000',
    APIROOT: 'http://localhost:8080/api',
    user_id: '1b10a09d-d342-4eee-a9eb-c99acd2dde17',
    api_test: 'http://localhost:8080/docs',
    api_reseed: 'http://localhost:8080/reseed',
    token_storage_variable: 'auth-token',
    login_modal_selector: 'div.modal-content',
    login_label: 'Login',
    login_user_select_selector: '#user-select',
    login_user_select_value: 'register',
    login_button_selector: '#btn-login',
    username: 'Earthdata Pub System',
    new_user_fullname: 'New User',
    new_email: 'example@edpub.com',
    email: 'no_email',
    nav_active_class: 'router-link-exact-active.router-link-active',
    overview_root: 'http://localhost:8082',
    history_tracking_variable: 'forms-arrived-from',
    login_input_name_selector: '#input-name',
    login_input_email_selector: '#input-email',
    login_button_register_selector: '#btn-register',
    login_logout_selector: '.logOut',
    request_id_required_modal_selector: '.redirect-modal',
    header_title_selector: 'span#title',
    header_title_default_value: 'Earthdata Publication Forms',
    header_form1_title_value: 'Data Accession Request',
    header_form2_title_value: 'Data Publication Request',
    daac_radio_label: 'ORNL DAAC',
    daac_radio_label_for_assign_workflow: 'GHRC DAAC',
    daac_description_selector: 'div#selected_description',
    daac_link_selector: 'a#selected_daac_link',
    daac_description_match_text: 'Oak Ridge',
    daac_link_href: 'daac.ornl.gov',
    new_request_button_class: '.new-request-button',
    assign_workflow_selector: '.assign-workflow',
    request_link_selector: '.table--wrapper a',
    request_dropdown_selector: '.dropdown__options__btn',
    reassign_workflow_selector: '.async__element',
    workflow_select_button_selector: '#selectButton',
    assign_form1_workflow_select_id: '.select_data_accession_request_workflow',
    assign_form2_workflow_select_id: '.select_data_publication_request_workflow',
    next_action_selector: '.next-action',
    new_request_link_selector: '.table__main-asset a',
    daac_select_button_selector: 'button#daac_select_button',
    daac_cancel_button_selector: 'button#daac_cancel_button',
    daac_nav_href_checks: 'Dashboard, Overview',
    daac_selection_url: '/daacs/selection',
    dashboard_pages: {
      'requests listing': '/requests',
      'workflows listing': '/workflows',
      'metrics listing': '/metrics',
      'users listing': '/users',
      'groups listing': '/groups',
      'roles listing': '/roles',
      'forms listing': '/forms',
      'questions listing': '/questions',
      'conversations listing': '/conversations',
      'modules listing': '/modules',
      'requests filter action': '/requests/status/action',
      'requests filter form': '/requests/status/form',
      'requests filter review': '/requests/status/review',
      'requests filter service': '/requests/status/service',
      'requests filter closed': '/requests/status/closed',
      'requests filter withdrawn': '/requests/withdrawn',
      'requests detail': '/requests/id/20e78804-c171-4549-bdab-6c7cf8e0fc72',
      'users detail': '/users/id/1b10a09d-d342-4eee-a9eb-c99acd2dde17',
      'group detail': '/groups/id/4daa6b22-f015-4ce2-8dac-8b3510004fca',
      'role detail': '/roles/id/804b335c-f191-4d26-9b98-1ec1cb62b97d',
      'workflow assignment':
        '/workflows?requestId=20e78804-c171-4549-bdab-6c7cf8e0fc72',
      'questions detail': '/questions/id/80ac5f52-9ed9-4139-b5f9-7b4cebb6a8e2',
      'questions add': '/questions/add',
      'forms detail':
        '/forms/id/6c544723-241c-4896-a38c-adbc0a364293?requestId=20e78804-c171-4549-bdab-6c7cf8e0fc72',
      'conversations detail':
        '/conversations/id/f0ca6e3d-cb48-4804-8287-377226d675aa',
      'modules detail': '/modules/test',
      'approval detail page':
        '/requests/approval?requestId=20e78804-c171-4549-bdab-6c7cf8e0fc72&step=tmp',
      'questions editing': '/questions/edit/80ac5f52-9ed9-4139-b5f9-7b4cebb6a8e2',
      'workflows detail': '/workflows/id/c0b4294f-3713-43ea-89af-83eba9eacff1',
      'workflows editing': '/workflows/edit/c0b4294f-3713-43ea-89af-83eba9eacff1'
    },
    forms_pages: {
      daac_selection_page: '/daacs/selection',
      questions_page: '/questions/'
    }
  },
  experimentalMemoryManagement: true,
  chromeWebSecurity: false,
  numTestsKeptInMemory: 1,

  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents (on, config) {
      return require('./cypress/plugins/index.js')(on, config);
    }
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  },
});
