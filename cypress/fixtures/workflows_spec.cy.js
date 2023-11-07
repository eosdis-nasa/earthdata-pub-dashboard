import { shouldBeRedirectedToLogin } from '../support/assertions';

describe('Dashboard Workflows Page', () => {
  describe('When not logged in', () => {
    it('should redirect to login page', () => {
      cy.visit(`${Cypress.env('baseUrl')}/workflows`);
      shouldBeRedirectedToLogin();
    });
  });

  describe('When logged in', () => {
    before(() => {
      cy.task('resetState');
      cy.visit(`${Cypress.env('baseUrl')}`);
    });

    beforeEach(() => {
      cy.login();
    });

    it('displays a list of workflows', () => {
      cy.visit(`${Cypress.env('baseUrl')}/workflows`);
      cy.get('.table .tbody .tr').should('have.length', 2);
      cy.contains('.table .tbody .tr .td', 'Initialization Workflow')
        .should('have.attr', 'href', '/workflows/id/c651b698-ec06-44d7-a69b-44bf8b4bc4f5');
      cy.contains('.table .tbody .tr .td', 'Archival Interest Workflow')
        .should('have.attr', 'href', '/workflows/id/4bc927f2-f34a-4033-afe3-02520cc7dcf7');
    });

    /* it('filters workflows when a user types in the search box', () => {
      cy.server();
      cy.route('GET', '/workflows*').as('get-workflows');
      cy.visit('/workflows');
      cy.get('.table .tbody .tr').should('have.length', 2);
      cy.get('.table .tbody .tr').first().contains('HelloWorldWorkflow');
      cy.get('.search').click().type('condtes');
      cy.get('.table .tbody .tr').first().contains('SecondTestWorkflow');
      cy.get('.table .tbody .tr').should('have.length', 1);
    }); */
  });
});
