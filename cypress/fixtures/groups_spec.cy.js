import { shouldBeRedirectedToLogin } from '../support/assertions';

describe('Dashboard Groups Page', () => {
  describe('When not logged in', () => {
    it('should redirect to login page', () => {
      cy.visit(`${Cypress.env('baseUrl')}/groups`);
      shouldBeRedirectedToLogin();
      const name = 'User';
      cy.visit(`${Cypress.env('baseUrl')}/groups/id/${name}`);
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
      cy.route('POST', `${Cypress.env('baseUrl')}/groups`).as('postGroup');
      cy.route('GET', `${Cypress.env('baseUrl')}/groups?limit=*`).as('getGroups');
      cy.route('GET', `${Cypress.env('baseUrl')}/groups/*`).as('getGroup');
    });

    it('should display a link to view groups', () => {
      cy.contains('nav li a', 'Groups').as('groups');
      cy.get('@groups').should('have.attr', 'href', '/groups');
      cy.get('@groups').click();

      cy.url().should('include', 'groups');
      cy.contains('.heading--xlarge', 'Groups');

      cy.get('.table .tbody .tr').should('have.length', 2);
    });

    it('should add a new group', () => {
      const name = 'Test Group';

      cy.visit(`${Cypress.env('baseUrl')}/groups`);

      cy.contains('.heading--large', 'Group Overview');
      cy.contains('a', 'Add Group').as('addGroup');
      cy.get('@addGroup').should('have.attr', 'href', '/groups/add');
      cy.get('@addGroup').click();

      cy.contains('.heading--xlarge', 'Groups');
      cy.contains('.heading--large', 'Create a group');

      // fill the group and submit
      cy.get('group div ul').as('groupinput');
      cy.get('@groupinput')
        .contains('Group Name')
        .siblings('input')
        .type(name);

      cy.get('group div button').contains('Submit').click();
      cy.wait('@postGroup');
      cy.wait('@getGroup');
      cy.url().should('include', `groups/id/${name}`);
      cy.contains('.heading--xlarge', 'Groups');
      cy.contains('.heading--large', name);
      cy.contains('.heading--medium', 'Group Overview');
      cy.get('.metadata__details')
        .within(() => {
          cy.contains('Group')
            .next()
            .contains('a', 'Link')
            .should('have.attr', 'href', name);
        });

      // Verify the new group is added to the groups list, after allowing
      // ES indexing to finish (hopefully), so that the new group is part
      // of the query results.
      cy.wait(1000);
      cy.contains('a', 'Back to Groups').click();
      cy.wait('@getGroups');
      cy.contains('.table .tbody .tr a', name)
        .should('have.attr', 'href', `/groups/id/${name}`);
    });

    it('should edit a group', () => {
      const name = 'Test Group';

      cy.visit(`${Cypress.env('baseUrl')}/groups/id/${name}`);
      cy.contains('.heading--large', name);
      cy.contains('a', 'Edit').as('editgroup');
      cy.get('@editgroup')
        .should('have.attr', 'href')
        .and('include', `/groups/edit/${name}`);
      cy.get('@editgroup').click();

      cy.contains('.heading--large', `Edit ${name}`);

      cy.get('group div ul').as('groupinput');
      cy.get('@groupinput')
        .contains('Group Name')
        .siblings('input')
        .clear()
        .type(name);

      cy.get('group div button').contains('Submit').click();

      // displays the updated group
      cy.contains('.heading--xlarge', 'Groups');
      cy.contains('.heading--large', name);
      cy.contains('.heading--medium', 'Group Overview');
      cy.get('.metadata__details')
        .within(() => {
          cy.contains('Group Name')
            .next()
            .contains('a', 'Link')
            .should('have.attr', 'href', name);
        });
    });

    it('should delete a group', () => {
      const name = 'Test Group';
      cy.visit(`${Cypress.env('baseUrl')}/groups/id/${name}`);
      cy.contains('.heading--large', name);

      // delete group
      cy.get('.dropdown__options__btn').click();
      cy.contains('span', 'Delete').click();
      cy.contains('button', 'Confirm').click();

      // verify the group is now gone
      cy.url().should('include', 'groups');
      cy.contains('.heading--xlarge', 'Groups');
      cy.contains('.table .tbody .tr', name).should('not.exist');
    });

    it('should fail to delete a group with an associated rule', () => {
      const name = 'Test Group';
      cy.visit(`${Cypress.env('baseUrl')}/groups/id/${name}`);
      cy.contains('.heading--large', name);

      // delete group
      cy.get('.dropdown__options__btn').click();
      cy.contains('span', 'Delete').click();
      cy.contains('button', 'Confirm').click();

      // error should be displayed indicating that deletion failed
      cy.contains('Group Overview')
        .parents('section')
        .get('.error__report');

      // group should still exist in list
      cy.contains('a', 'Back to Groups').click();
      cy.contains('.heading--xlarge', 'Groups');
      cy.contains('.table .tbody .tr a', name);
    });
  });
});
