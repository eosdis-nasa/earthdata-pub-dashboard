import { shouldBeRedirectedToLogin } from '../support/assertions';

describe('Dashboard Forms Page', () => {
  describe('When not logged in', () => {
    it('should redirect to login page', () => {
      cy.visit('/forms');
      shouldBeRedirectedToLogin();
      const formId = '';
      cy.visit(`/forms/id/${formId}`);
      shouldBeRedirectedToLogin();
    });
  });

  describe('When logged in', () => {
    before(() => {
      cy.visit('/');
      cy.task('resetState');
    });

    beforeEach(() => {
      cy.login();
      cy.task('resetState');
      cy.visit('/');
      cy.server();
      cy.route('POST', '/forms').as('postForm');
      cy.route('GET', '/forms?limit=*').as('getForms');
      cy.route('GET', '/forms/*').as('getForm');
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
