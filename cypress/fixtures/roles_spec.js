import { shouldBeRedirectedToLogin } from '../support/assertions';

describe('Dashboard Roles Page', () => {
  describe('When not logged in', () => {
    it('should redirect to login page', () => {
      cy.visit('/roles');
      shouldBeRedirectedToLogin();
    });
  });

  describe('When logged in', () => {
    before(() => {
      cy.task('resetState');
      cy.visit('/');
    });

    beforeEach(() => {
      cy.login();
    });

    it('displays a list of roles', () => {
      cy.visit('/roles');
      cy.get('.table .tbody .tr').should('have.length', 2);
      cy.contains('.table .tbody .tr .td', 'poc')
        .should('have.attr', 'href', '/roles/id/29ccab4b-65e2-4764-83ec-77375d29af39');
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
