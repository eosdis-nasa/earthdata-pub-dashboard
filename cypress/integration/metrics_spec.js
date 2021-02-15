import { shouldBeRedirectedToLogin } from '../support/assertions';

describe('Dashboard Metrics Page', () => {
  describe('When not logged in', () => {
    it('should redirect to login page', () => {
      cy.visit('/metrics');
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

    it('displays a list of metrics', () => {
      cy.visit('/metrics');
      cy.get('.table .tbody .tr').should('have.length', 2);
      cy.contains('.table .tbody .tr .td', 'workflow_promote_step');
      // .should('have.attr', 'href', '/metrics/id/workflow_promote_step');
      cy.contains('.table .tbody .tr .td', 'workflow_completed');
      // .should('have.attr', 'href', '/metrics/id/workflow_completed');
    });

    /* it('filters metrics when a user types in the search box', () => {
      cy.server();
      cy.route('GET', '/metrics*').as('get-metrics');
      cy.visit('/metrics');
      cy.get('.table .tbody .tr').should('have.length', 2);
      cy.get('.table .tbody .tr').first().contains('HelloWorldMetric');
      cy.get('.search').click().type('condtes');
      cy.get('.table .tbody .tr').first().contains('SecondTestMetric');
      cy.get('.table .tbody .tr').should('have.length', 1);
    }); */
  });
});
