import { shouldBeRedirectedToLogin } from '../support/assertions';

describe('Dashboard Roles Page', () => {
  describe('When not logged in', () => {
    it('should redirect to login page', () => {
      cy.visit(`${Cypress.env('baseUrl')}/roles`);
      shouldBeRedirectedToLogin();
    });
  });

  describe('When logged in', () => {
    before(() => {
      cy.task('resetState');
      cy.visit(`${Cypress.env('baseUrl')}`);
    });

    beforeEach(() => {
      // cy.login();
    });

    it('displays a list of roles', () => {
      cy.visit(`${Cypress.env('baseUrl')}/roles`);
      cy.get('.table .tbody .tr').should('have.length', 2);
      cy.contains('.table .tbody .tr .td', 'poc')
        .should('have.attr', 'href', '/roles/id/804b335c-f191-4d26-9b98-1ec1cb62b97d');
      cy.contains('.table .tbody .tr .td', 'Data Producer');
    });

    /* it('filters roles when a user types in the search box', () => {
      cy.server();
      cy.route('GET', '/roles*').as('get-roles');
      cy.visit('/roles');
      cy.get('.table .tbody .tr').should('have.length', 2);
      cy.get('.table .tbody .tr').first().contains('HelloWorldRole');
      cy.get('.search').click().type('condtes');
      cy.get('.table .tbody .tr').first().contains('SecondTestRole');
      cy.get('.table .tbody .tr').should('have.length', 1);
    }); */
  });
});
