/* These are sanity tests to verify all is working
so all tests don't fail out the gate */

describe('sanity testing', () => {
  it('Verifies local Earthdata Pub API is live', () => {
    cy.visit(Cypress.env('api_test'));
  });
  it('Verifies local Earthdata Pub Dashboard is live', () => {
    cy.visit(Cypress.env('baseUrl'));
  });
  it('Tests reseeding the database', () => {
    cy.request(Cypress.env('api_reseed'))
      .should((response) => {
        expect(response.status).to.eq(200);
      });
  });
});
