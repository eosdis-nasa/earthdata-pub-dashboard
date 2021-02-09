import { shouldBeRedirectedToLogin } from '../support/assertions';

describe('Dashboard Questions Page', () => {
  describe('When not logged in', () => {
    it('should redirect to login page', () => {
      cy.visit('/questions');
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

    it('displays a list of questions', () => {
      cy.visit('/questions');
      cy.get('.table .tbody .tr').should('have.length', 2);
      cy.contains('.table .tbody .tr .td', 'Primary Data Producer')
        .should('have.attr', 'href', '/questions/id/80ac5f52-9ed9-4139-b5f9-7b4cebb6a8e2');
      cy.contains('.table .tbody .tr .td', 'Publication Point of Contact')
        .should('have.attr', 'href', '/questions/id/f3e2eab9-6375-4e53-9cc2-3d16f318d333');
    });

    /* it('filters questions when a user types in the search box', () => {
      cy.server();
      cy.route('GET', '/questions*').as('get-questions');
      cy.visit('/questions');
      cy.get('.table .tbody .tr').should('have.length', 2);
      cy.get('.table .tbody .tr').first().contains('HelloWorldQuestion');
      cy.get('.search').click().type('condtes');
      cy.get('.table .tbody .tr').first().contains('SecondTestQuestion');
      cy.get('.table .tbody .tr').should('have.length', 1);
    }); */
  });
});
