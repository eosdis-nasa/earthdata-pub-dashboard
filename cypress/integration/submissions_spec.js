import { shouldBeRedirectedToLogin } from '../support/assertions';
import { DATEPICKER_DATECHANGE } from '../../app/src/js/actions/types';
import { msPerDay } from '../../app/src/js/utils/datepicker';

describe('Dashboard Submissions Page', () => {
  describe('When not logged in', () => {
    it('should redirect to login page', () => {
      cy.visit('/submissions');
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
      cy.visit('/');
    });

    it('should display a link to view submissions', () => {
      cy.visit('/submissions');
      cy.url().should('include', 'submissions');
      cy.contains('.heading--xlarge', 'Submissions');
      cy.contains('.heading--large', 'Submission Overview');

      // shows a summary count of completed and failed submissions
      cy.get('.overview-num__wrapper ul li')
        .first().contains('li', 'Completed').contains('li', 7)
        .next().contains('li', 'Failed').contains('li', 2)
        .next().contains('li', 'Running').contains('li', 2);

      // shows a list of submissions
      cy.getFakeApiFixture('submissions').as('submissionsListFixture');

      cy.get('@submissionsListFixture').its('results')
        .each((submission) => {
          // Wait for this submission to appear before proceeding.
          cy.contains(submission.submissionId);
          cy.get(`[data-value="${submission.submissionId}"]`).children().as('columns');
          cy.get('@columns').should('have.length', 8);

          // Submission Status Column is correct
          cy.get('@columns').eq(1).invoke('text')
            .should('be.eq', submission.status.replace(/^\w/, c => c.toUpperCase()));

          // has link to the submission list with the same status
          cy.get('@columns').eq(1).children('a')
            .should('have.attr', 'href')
            .and('be.eq', `/submissions/${submission.status}`);

          // Submission Stage Column is correct
          cy.get('@columns').eq(2).invoke('text')
            .should('be.eq', submission.stage.replace(/^\w/, c => c.toUpperCase()));

          // submission Name (id) column
          cy.get('@columns').eq(3).invoke('text')
            .should('be.eq', submission.submissionId);

          // has link to the detailed submission page
          cy.get('@columns').eq(3).children('a')
            .should('have.attr', 'href')
            .and('be.eq', `/data/submission/${submission.submissionId}`);

          // Data Submission Request column has link to the form page
          cy.get('@columns').eq(4).children('a')
            .should('have.attr', 'href')
            .and('be.eq', `/data/form/${submission.formId}`);

          // Data Product Questionaire column has link to the form page
          cy.get('@columns').eq(5).children('a')
            .should('have.attr', 'href')
            .and('be.eq', `/data/form/${submission.formId}`);

          // Submission Date column
          cy.get('@columns').eq(6).invoke('text')
            .should('match', /.+ago$/);

          // Primary Data Producer column has link to the form page
          cy.get('@columns').eq(7).children('a')
            .should('have.attr', 'href')
            .and('be.eq', `/forms/id/${submission.dataSubmissionRequest}`);

          // Contact column has link to the form page
          cy.get('@columns').eq(8).children('a')
            .should('have.attr', 'href')
            .and('be.eq', `/forms/id/${submission.dataSubmissionRequest}`);

          // Workflow column has link to the workflow page
          cy.get('@columns').eq(9).children('a')
            .should('have.attr', 'href')
            .and('be.eq', `/workflows/id/${submission.workflow}`);

          // Updated column
          cy.get('@columns').eq(10).invoke('text')
            .should('match', /.+ago$/);
        });

      cy.get('.table .tbody .tr').as('list');
      cy.get('@list').should('have.length', 11);
    });

    it('Should update dropdown with label when visiting bookmarkable URL', () => {
      cy.visit('/submissions?status=running');
      cy.get('#form-Status-status > div > input').as('status-input');
      cy.get('@status-input').should('have.value', 'Running');

      cy.visit('/submissions?status=completed');
      cy.get('#form-Status-status > div > input').as('status-input');
      cy.get('@status-input').should('have.value', 'Completed');
    });

    it('Should update URL when dropdown filters are activated.', () => {
      cy.visit('/submissions');
      cy.get('#form-Status-status > div > input').as('status-input');
      cy.get('@status-input').click().type('fai').type('{enter}');
      cy.url().should('include', '?status=failed');
    });

    it('Should update URL when search filter is changed.', () => {
      cy.visit('/submissions');
      cy.get('.search').as('search');
      cy.get('@search').click().type('L2');
      cy.url().should('include', 'search=L2');
    });

    it('Should show Search and Dropdown filters in URL.', () => {
      cy.visit('/submissions');
      cy.get('.search').as('search');
      cy.get('@search').should('be.visible').click().type('L2');
      cy.get('#form-Status-status > div > input').as('status-input');
      cy.get('@status-input').should('be.visible').click().type('comp{enter}');
      cy.url().should('include', 'search=L2').and('include', 'status=completed');
    });

    it.skip('should Update overview Tiles when datepicker state changes.', () => {
      // TODO Enable test when EDPUB-1805 is completed
      cy.visit('/submissions');
      cy.url().should('include', 'submissions');
      cy.contains('.heading--xlarge', 'Submissions');
      cy.contains('.heading--large', 'Submission Overview');

      // shows a summary count of completed and failed submissions
      cy.get('.overview-num__wrapper ul li')
        .first().contains('li', 'Completed').contains('li', 7)
        .next().contains('li', 'Failed').contains('li', 2)
        .next().contains('li', 'Running').contains('li', 2);
      cy.window().its('appStore').then((store) => {
        store.dispatch({
          type: DATEPICKER_DATECHANGE,
          data: {
            startDateTime: new Date(Date.now() - 5 * msPerDay),
            endDateTime: new Date(Date.now() - 4 * msPerDay)
          }
        });
        cy.get('.overview-num__wrapper ul li')
          .first().contains('li', 'Completed').contains('li', 0)
          .next().contains('li', 'Failed').contains('li', 0)
          .next().contains('li', 'Running').contains('li', 0);
      });
    });

    it('Should update the table when the Results Per Page dropdown is changed.', () => {
      cy.visit('/submissions');
      cy.get('.filter__item').eq(3).as('page-size-input');
      cy.get('@page-size-input').should('be.visible').click().type('10{enter}');
      cy.url().should('include', 'limit=10');
      cy.get('.table .tbody .tr').should('have.length', 10);
      cy.get('.pagination ol li')
        .first().contains('li', 'Previous')
        .next().contains('li', '1')
        .next().contains('li', '2');
    });

    it('Should reingest a submission and redirect to the submissions detail page.', () => {
      const submissionId = 'MOD09GQ.A0142558.ee5lpE.006.5112577830916';
      cy.server();
      cy.route({
        method: 'PUT',
        url: '/submissions/*',
        status: 200,
        response: { message: 'ingested' }
      });
      cy.visit('/submissions');
      cy.get(`[data-value="${submissionId}"] > .td >input[type="checkbox"]`).click();
      cy.get('.list-actions').contains('Reingest').click();
      cy.get('.button--submit').click();
      cy.get('.modal-content > .modal-title').should('contain.text', 'Complete');
      cy.get('.button__goto').click();
      cy.url().should('include', `data/submission/${submissionId}`);
      cy.get('.heading--large').should('have.text', submissionId);
    });

    it('Should reingest multiple submissions and redirect to the running page.', () => {
      const submissionIds = [
        'MOD09GQ.A0142558.ee5lpE.006.5112577830916',
        'MOD09GQ.A9344328.K9yI3O.006.4625818663028'
      ];
      cy.server();
      cy.route({
        method: 'PUT',
        url: '/submissions/*',
        status: 200,
        response: { message: 'ingested' }
      });
      cy.visit('/submissions');
      cy.get(`[data-value="${submissionIds[0]}"] > .td >input[type="checkbox"]`).click();
      cy.get(`[data-value="${submissionIds[1]}"] > .td >input[type="checkbox"]`).click();
      cy.get('.list-actions').contains('Reingest').click();
      cy.get('.button--submit').click();
      cy.get('.modal-content > .modal-title').should('contain.text', 'Complete');
      cy.get('.button__goto').click();
      cy.url().should('include', 'submissions/processing');
      cy.get('.heading--large').should('have.text', 'Running Submissions 2');
    });

    it('Should fail to reingest multiple submissions and remain on the page.', () => {
      const submissionIds = [
        'MOD09GQ.A0142558.ee5lpE.006.5112577830916',
        'MOD09GQ.A9344328.K9yI3O.006.4625818663028'
      ];
      cy.server();
      cy.route({
        method: 'PUT',
        url: '/submissions/*',
        status: 500,
        response: { message: 'Oopsie' }
      });
      cy.visit('/submissions');
      cy.get(`[data-value="${submissionIds[0]}"] > .td >input[type="checkbox"]`).click();
      cy.get(`[data-value="${submissionIds[1]}"] > .td >input[type="checkbox"]`).click();
      cy.get('.list-actions').contains('Reingest').click();
      cy.get('.button--submit').click();
      cy.get('.modal-content > .modal-title').should('contain.text', 'Error');
      cy.get('.error').should('contain.text', 'Oopsie');
      cy.get('.button--cancel').click();
      cy.url().should('match', /\/submissions$/);
      cy.get('.heading--large').should('have.text', 'Submission Overview');
    });
  });
});
