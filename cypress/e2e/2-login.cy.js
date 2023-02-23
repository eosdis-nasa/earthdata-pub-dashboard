before(() => {
  Cypress.on('window:before:load', (win) => {
    win.addEventListener('unhandledrejection', (event) => {
      const msg = `UNHANDLED PROMISE REJECTION: ${event.reason}`;

      // fail the test
      // throw new Error(JSON.stringify(msg))
      return false;
    });
  });
  Cypress.on('uncaught:exception', (event, err, runnable) => {
    const msg = `UNCAUGHT EXCEPTION: ${err}`;
    // returning false here prevents Cypress from
    // failing the test
    // throw new Error(JSON.stringify(msg))
    return false;
  });
});
describe('Logging in', () => {
  it(`Login to the dashboard as ${Cypress.env('username')}`, () => {
    cy.removeLocalStorage(`${Cypress.env('token_storage_variable')}`);
    cy.visit(`${Cypress.env('forms_root')}${Cypress.env('forms_pages').daac_selection_page}`);
    cy.getLocalStorage(`${Cypress.env('token_storage_variable')}`)
      .then($token => {
        if ($token == null) {
          cy.get(`${Cypress.env('login_modal_selector')}`).should('be.visible')
            .find('button').should('contain', `${Cypress.env('login_label')}`).click();
          cy.get(`${Cypress.env('login_user_select_selector')}`)
            .should('have.value', `${Cypress.env('login_user_select_value')}`);
          cy.get(`${Cypress.env('login_user_select_selector')}`)
            .select(`${Cypress.env('user_id')}`);
          cy.get(`${Cypress.env('login_button_selector')}`)
            .should('be.visible').trigger('click');
        }
      });
  });
  it(`Login to the dashboard as ${Cypress.env('new_user_fullname')}, then log out`, () => {
    cy.removeLocalStorage(`${Cypress.env('token_storage_variable')}`);
    cy.visit(Cypress.env('baseUrl'));
    cy.getLocalStorage(`${Cypress.env('token_storage_variable')}`)
      .then($token => {
        if ($token == null) {
          cy.get(`${Cypress.env('login_modal_selector')}`).should('be.visible')
            .find('button').should('contain', `${Cypress.env('login_label')}`).click();
          cy.get(`${Cypress.env('login_user_select_selector')}`)
            .should('have.value', `${Cypress.env('login_user_select_value')}`);
          cy.get(`${Cypress.env('login_input_name_selector')}`)
            .type(`${Cypress.env('new_user_fullname')}`)
            .should('have.value', `${Cypress.env('new_user_fullname')}`);
          cy.get(`${Cypress.env('login_input_email_selector')}`)
            .type(`${Cypress.env('new_email')}`)
            .should('have.value', `${Cypress.env('new_email')}`);
          cy.get(`${Cypress.env('login_button_register_selector')}`)
            .should('be.visible').trigger('click');
        }
      });
    cy.url().should('eq', `${Cypress.env('baseUrl')}/`);
    cy.get(`${Cypress.env('login_logout_selector')}`).should('be.visible').trigger('click');
  });
});
