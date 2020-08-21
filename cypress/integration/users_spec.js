import { shouldBeRedirectedToLogin } from '../support/assertions';

describe('Dashboard Users Page', () => {
  describe('When not logged in', () => {
    it('should redirect to login page', () => {
      cy.visit('/users');
      shouldBeRedirectedToLogin();

      const userId = 'test-user';
      cy.visit(`/users/user/${userId}`);
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
      cy.route('POST', '/users').as('postUser');
      cy.route('GET', '/users?limit=*').as('getUsers');
      cy.route('GET', '/users/*').as('getUser');
    });

    it('should display a link to view users', () => {
      cy.contains('nav li a', 'Users').as('users');
      cy.get('@users').should('have.attr', 'href', '/users');
      cy.get('@users').click();

      cy.url().should('include', 'users');
      cy.contains('.heading--xlarge', 'Users');

      cy.get('.table .tbody .tr').should('have.length', 2);
    });

    it('should add a new user', () => {
      const name = 'Test User';
      const email = 'blah@example.com';

      cy.visit('/users');

      cy.contains('.heading--large', 'User Overview');
      cy.contains('a', 'Add User').as('addUser');
      cy.get('@addUser').should('have.attr', 'href', '/users/add');
      cy.get('@addUser').click();

      cy.contains('.heading--xlarge', 'Users');
      cy.contains('.heading--large', 'Create a user');

      // fill the form and submit
      cy.get('form div ul').as('userinput');
      cy.get('@userinput')
        .contains('User Name')
        .siblings('input')
        .type(name);
      cy.get('@userinput')
        .contains('Email')
        .siblings('input')
        .type(email);

      cy.get('form div button').contains('Submit').click();
      cy.wait('@postUser');
      cy.wait('@getUser');
      cy.url().should('include', `users/user/${name}`);
      cy.contains('.heading--xlarge', 'Users');
      cy.contains('.heading--large', name);
      cy.contains('.heading--medium', 'User Overview');
      cy.get('.metadata__details')
        .within(() => {
          cy.contains('Email')
            .next()
            .contains('a', 'Link')
            .should('have.attr', 'href', email);
        });

      // Verify the new user is added to the users list, after allowing
      // ES indexing to finish (hopefully), so that the new user is part
      // of the query results.
      cy.wait(1000);
      cy.contains('a', 'Back to Users').click();
      cy.wait('@getUsers');
      cy.contains('.table .tbody .tr a', name)
        .should('have.attr', 'href', `/users/user/${name}`);
    });

    it('should edit a user', () => {
      const name = 'test-user';
      const email = 'blah@example.com';

      cy.visit(`/users/user/${name}`);
      cy.contains('.heading--large', name);
      cy.contains('a', 'Edit').as('edituser');
      cy.get('@edituser')
        .should('have.attr', 'href')
        .and('include', `/users/edit/${name}`);
      cy.get('@edituser').click();

      cy.contains('.heading--large', `Edit ${name}`);

      cy.get('form div ul').as('userinput');
      cy.get('@userinput')
        .contains('Name')
        .siblings('input')
        .clear()
        .type(name);

      cy.get('form div button').contains('Submit').click();

      // displays the updated user
      cy.contains('.heading--xlarge', 'Users');
      cy.contains('.heading--large', name);
      cy.contains('.heading--medium', 'User Overview');
      cy.get('.metadata__details')
        .within(() => {
          cy.contains('Name')
            .next()
            .contains('a', 'Link')
            .should('have.attr', 'href', name);
        })
        .within(() => {
          cy.contains('Email')
            .next()
            .contains('a', 'Link')
            .should('have.attr', 'href', email);
        });
    });

    it('should delete a user', () => {
      const name = 'test-user';
      cy.visit(`/users/user/${name}`);
      cy.contains('.heading--large', name);

      // delete user
      cy.get('.dropdown__options__btn').click();
      cy.contains('span', 'Delete').click();
      cy.contains('button', 'Confirm').click();

      // verify the user is now gone
      cy.url().should('include', 'users');
      cy.contains('.heading--xlarge', 'Users');
      cy.contains('.table .tbody .tr', name).should('not.exist');
    });

    it('should fail to delete a user with an associated rule', () => {
      const name = 'Test User';
      cy.visit(`/users/user/${name}`);
      cy.contains('.heading--large', name);

      // delete user
      cy.get('.dropdown__options__btn').click();
      cy.contains('span', 'Delete').click();
      cy.contains('button', 'Confirm').click();

      // error should be displayed indicating that deletion failed
      cy.contains('User Overview')
        .parents('section')
        .get('.error__report');

      // user should still exist in list
      cy.contains('a', 'Back to Users').click();
      cy.contains('.heading--xlarge', 'Users');
      cy.contains('.table .tbody .tr a', name);
    });
  });
});
