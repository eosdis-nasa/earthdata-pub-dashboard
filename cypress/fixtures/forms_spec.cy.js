import { shouldBeRedirectedToLogin } from '../support/assertions';

describe('Dashboard Forms Page', () => {
  describe('When not logged in', () => {
    it('should redirect to login page', () => {
      cy.visit(`${Cypress.env('baseUrl')}/forms`);
      shouldBeRedirectedToLogin();
      const formId = '';
      cy.visit(`${Cypress.env('baseUrl')}/forms/id/${formId}`);
      shouldBeRedirectedToLogin();
    });
  });

  describe('When logged in', () => {
    before(() => {
      cy.visit(`${Cypress.env('baseUrl')}`);
      cy.task('resetState');
    });

    beforeEach(() => {
      cy.login();
      cy.task('resetState');
      cy.visit(`${Cypress.env('baseUrl')}`);
      cy.server();
      cy.route('POST', `${Cypress.env('baseUrl')}/forms`).as('postForm');
      cy.route('GET', `${Cypress.env('baseUrl')}/forms?limit=*`).as('getForms');
      cy.route('GET', `${Cypress.env('baseUrl')}/forms/*`).as('getForm');
    });

    it('should display a link to view forms', () => {
      cy.contains('nav li a', 'Forms').as('forms');
      cy.get('@forms').should('have.attr', 'href', '/forms');
      cy.get('@forms').click();

      cy.url().should('include', 'forms');
      cy.contains('.heading--xlarge', 'Forms');

      cy.get('.table .tbody .tr').should('have.length', 2);
    });
  });
});
