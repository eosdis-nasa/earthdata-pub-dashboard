/* Section 508 checks for the shared SortSite issues.
   WCAG 2.0 A and AA only. The NASA header is out of scope.
   The 7:1 contrast check is AAA and is not asserted here. */

const nasaSelector = [
  '#earthdata-tophat2',
  '.th-fbm-link-container',
  '.th-menu-section',
  '.th-left-section',
  '#th-help-link',
  '.th-right-panel-link',
  '#link-name',
  '.th-left-title',
  '#th-home-link'
].join(', ');

function isNasa (el) {
  return el.closest(nasaSelector) !== null;
}

function isHiddenFromAt (el) {
  if (el.closest('[hidden], [aria-hidden="true"]')) return true;
  const style = el.ownerDocument.defaultView.getComputedStyle(el);
  return style.display === 'none' || style.visibility === 'hidden';
}

function accessibleName (el) {
  const doc = el.ownerDocument;
  const labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    const text = labelledBy.split(/\s+/).map((id) => {
      const node = doc.getElementById(id);
      return node ? node.textContent : '';
    }).join(' ').replace(/\s+/g, ' ').trim();
    if (text) return text;
  }
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();
  const text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
  if (text) return text;
  const title = el.getAttribute('title');
  if (title && title.trim()) return title.trim();
  const image = el.querySelector('img[alt]');
  if (image && image.getAttribute('alt').trim()) return image.getAttribute('alt').trim();
  return '';
}

function pagesUnderTest () {
  return Object.assign({
    home: '/',
    auth: '/auth',
    help: '/help',
    'getting started': '/getting_started',
    'data publication guidelines': '/data_publication_guidelines'
  }, Cypress.env('dashboard_pages'));
}

before(() => {
  Cypress.on('uncaught:exception', () => false);
});

describe('Section 508', () => {
  beforeEach(() => {
    cy.login();
  });

  it('keeps a keyboard focus ring and hides it after a click', () => {
    cy.visit(`${Cypress.env('baseUrl')}/`);
    cy.get('main', { timeout: 20000 }).should('have.length', 1);
    cy.document().then((doc) => {
      const css = [];
      for (const sheet of doc.styleSheets) {
        let rules;
        try {
          rules = sheet.cssRules;
        } catch (e) {
          continue;
        }
        if (!rules) continue;
        for (const rule of rules) {
          if (rule.selectorText && rule.selectorText.indexOf('focus-visible') !== -1) {
            css.push(rule.cssText);
          }
        }
      }
      const focusCss = css.join('\n');
      expect(focusCss, 'keyboard focus outline').to.contain(':focus-visible');
      expect(focusCss, 'keyboard focus outline').to.contain('solid 3px');
      expect(focusCss, 'mouse click does not keep the outline').to.contain(':focus:not(:focus-visible)');
    });
  });

  it('meets the shared Section 508 checks on each screen', () => {
    const pages = pagesUnderTest();
    const axeFailures = [];
    for (const name in pages) {
      const pageUrl = `${Cypress.env('baseUrl')}${pages[name]}`;
      cy.visit(pageUrl);
      cy.get('main', { timeout: 20000 }).should('have.length', 1);
      cy.get('main main').should('have.length', 0);
      cy.get('.loading', { timeout: 20000 }).should('not.exist');
      cy.get('body').then(($body) => {
        const header = $body.find('div.header');
        if (header.length) {
          expect(header.attr('aria-label'), `${name} header label`).to.equal(undefined);
        }

        const emptyHeadings = [];
        $body.find('h1, h2, h3, h4, h5, h6').each((_, el) => {
          if (isNasa(el) || isHiddenFromAt(el)) return;
          if (!(el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim()) {
            emptyHeadings.push(el.outerHTML.slice(0, 160));
          }
        });
        expect(emptyHeadings, `${name} empty headings`).to.deep.equal([]);

        const unnamed = [];
        $body.find('a, button, [role="button"], [role="link"]').each((_, el) => {
          if (isNasa(el) || isHiddenFromAt(el)) return;
          if (!accessibleName(el)) unnamed.push(el.outerHTML.slice(0, 180));
        });
        expect(unnamed, `${name} links and buttons need a name`).to.deep.equal([]);

        const imagesWithoutAlt = [];
        $body.find('img').each((_, el) => {
          if (isNasa(el)) return;
          if (!el.hasAttribute('alt')) imagesWithoutAlt.push(el.outerHTML.slice(0, 180));
        });
        expect(imagesWithoutAlt, `${name} images need alt`).to.deep.equal([]);

        const unnamedInputs = [];
        $body.find('input[type="checkbox"], input[type="radio"]').each((_, el) => {
          if (isNasa(el) || isHiddenFromAt(el)) return;
          const wrapped = el.closest('label');
          const labelled = el.id && $body.find(`label[for="${el.id}"]`).length;
          if (!accessibleName(el) && !(wrapped && wrapped.innerText.trim()) && !labelled) {
            unnamedInputs.push(el.outerHTML.slice(0, 180));
          }
        });
        expect(unnamedInputs, `${name} checkboxes and radios need a name`).to.deep.equal([]);
      });

      cy.injectAxe();
      cy.checkA11y({
        exclude: nasaSelector.split(', ')
      }, {
        runOnly: {
          type: 'rule',
          values: ['link-name', 'button-name', 'image-alt']
        }
      }, null, false);
      cy.checkA11y({
        exclude: nasaSelector.split(', ')
      }, {
        runOnly: {
          type: 'rule',
          values: ['color-contrast']
        }
      }, (violations) => {
        if (!violations.length) return;
        violations.forEach((violation) => {
          const seen = {};
          violation.nodes.forEach((node) => {
            const summary = (node.failureSummary || '').replace(/\s+/g, ' ');
            if (seen[summary]) return;
            seen[summary] = true;
            axeFailures.push(`${violation.id} on ${pageUrl} (${violation.nodes.length}) ${node.target.join(' ')} — ${summary}`);
          });
        });
      }, true);
    }
    cy.then(() => {
      expect(axeFailures, axeFailures.join('\n\n')).to.deep.equal([]);
    });
  });
});
