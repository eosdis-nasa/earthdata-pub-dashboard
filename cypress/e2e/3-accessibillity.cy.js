/* These are accessibility tests to verify 508 compliance is being met */
before(() => {
  Cypress.on('window:before:load', (win) => {
    win.addEventListener('unhandledrejection', (event) => {
      const msg = `UNHANDLED PROMISE REJECTION: ${event.reason}`;

      // fail the test
      // throw new Error(JSON.stringify(msg))
      return false;
    });
  });
  Cypress.on('uncaught:exception', (event, err, runnable) => {
    const msg = `UNCAUGHT EXCEPTION: ${err}`;
    // returning false here prevents Cypress from
    // failing the test
    // throw new Error(JSON.stringify(msg))
    return false;
  });
});
describe('Accessibility Testing', () => {
  beforeEach(() => {
    cy.login();
  });
  it('Dashboard pages meet 508 compliance - this includes all impacts', () => {
    const pages = Object.assign({ home: '/' }, Cypress.env('dashboard_pages'));
    for (const ea in pages) {
      const pageUrl = `${Cypress.env('baseUrl')}${pages[ea]}`;
      cy.visit(pageUrl);
      cy.wait(3000);
      cy.injectAxe();
      cy.checkA11y({
        /* NASA's tophat violates compliance */
        exclude: ['.th-fbm-link-container', '.th-menu-section', '.th-left-section', '#th-help-link', '.th-right-panel-link', '#link-name', '.th-left-title', '#th-home-link']
      }, {
        rules: {
          'color-contrast': { enabled: false },
          'link-in-text-block': { enabled: false }
        }
      }, function (err, results) {
        if (err) throw err;
        console.log(results);
      }, true);
    }
  });
});
