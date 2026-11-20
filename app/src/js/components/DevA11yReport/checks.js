'use strict';

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

function isOurs (el) {
  return el.closest('#dev-a11y-report') !== null;
}

function isNasa (el) {
  return el.closest(nasaSelector) !== null;
}

function isHiddenFromAt (el) {
  if (el.closest('[hidden], [aria-hidden="true"]')) return true;
  const style = el.ownerDocument.defaultView.getComputedStyle(el);
  return style.display === 'none' || style.visibility === 'hidden';
}

function skip (el) {
  return isOurs(el) || isNasa(el) || isHiddenFromAt(el);
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

function snippet (el) {
  return el.outerHTML.replace(/\s+/g, ' ').slice(0, 160);
}

function list (nodes, limit) {
  const sample = nodes.slice(0, limit).map(snippet);
  const extra = nodes.length - sample.length;
  return extra > 0 ? `${sample.join('\n')}\n+${extra} more` : sample.join('\n');
}

function check (title, pass, detail) {
  return { title, pass, detail: detail || '' };
}

function parseColor (value) {
  const match = /rgba?\(([^)]+)\)/.exec(value || '');
  if (!match) return null;
  const parts = match[1].split(',').map((part) => parseFloat(part));
  return {
    r: parts[0],
    g: parts[1],
    b: parts[2],
    a: parts.length > 3 ? parts[3] : 1
  };
}

function channel (c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance (color) {
  return (0.2126 * channel(color.r)) + (0.7152 * channel(color.g)) + (0.0722 * channel(color.b));
}

function contrastRatio (foreground, background) {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function opaqueBackground (el) {
  let node = el;
  while (node) {
    const color = parseColor(el.ownerDocument.defaultView.getComputedStyle(node).backgroundColor);
    if (color && color.a >= 0.99) return color;
    node = node.parentElement;
  }
  return { r: 255, g: 255, b: 255, a: 1 };
}

function ownText (el) {
  let text = '';
  el.childNodes.forEach((node) => {
    if (node.nodeType === 3) text += node.textContent;
  });
  return text.replace(/\s+/g, ' ').trim();
}

function contrastFailures (doc, aaa) {
  const seen = {};
  const failures = [];
  const selector = aaa
    ? 'h1, h2, h3, h4, h5, h6, p, a, button, label, li, td, th, span, caption, div'
    : 'h1, h2, h3, h4, h5, h6, p, a, button, label, li, td, th, span, caption';
  doc.body.querySelectorAll(selector).forEach((el) => {
    if (isOurs(el) || !ownText(el) || isHiddenFromAt(el)) return;
    if (!aaa && isNasa(el)) return;
    const style = doc.defaultView.getComputedStyle(el);
    const foreground = parseColor(style.color);
    if (!foreground || foreground.a < 0.99) return;
    const background = opaqueBackground(el);
    const ratio = contrastRatio(foreground, background);
    const size = parseFloat(style.fontSize);
    const weight = parseInt(style.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const minimum = aaa ? (large ? 4.5 : 7) : (large ? 3 : 4.5);
    if (ratio + 0.05 >= minimum) return;
    const key = `${ratio.toFixed(2)}|${style.color}|${el.tagName}`;
    if (seen[key]) return;
    seen[key] = true;
    failures.push({
      el,
      detail: `${ratio.toFixed(2)}:1, needs ${minimum}:1, ${style.color} on ${background.r},${background.g},${background.b}`
    });
  });
  return failures;
}

function eachRule (doc, visit) {
  const walk = (rules) => {
    if (!rules) return;
    for (const rule of rules) {
      if (rule.cssRules) walk(rule.cssRules);
      else visit(rule);
    }
  };
  for (const sheet of doc.styleSheets) {
    try {
      walk(sheet.cssRules);
    } catch (e) {
      continue;
    }
  }
}

function sectionOwnsHeading (section) {
  const headings = section.querySelectorAll('h1, h2, h3, h4, h5, h6');
  for (const heading of headings) {
    if (heading.closest('section') === section) return true;
  }
  return false;
}

function focusCss (doc) {
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
  return css.join('\n');
}

function runA11yReport (doc) {
  const checks = [];
  const mains = Array.from(doc.querySelectorAll('main')).filter((el) => !isOurs(el));
  checks.push(check('One main region', mains.length === 1, mains.length === 1 ? '' : `Found ${mains.length}.`));
  checks.push(check('No main inside main', doc.querySelector('main main') === null, ''));

  const skipLink = doc.querySelector('a.skip-link');
  checks.push(check(
    'Skip link points at main',
    !!(skipLink && skipLink.getAttribute('href') === '#main-content'),
    skipLink ? '' : 'Skip link is missing.'
  ));

  const mainContent = doc.getElementById('main-content');
  checks.push(check(
    'Main can receive focus',
    !!(mainContent && mainContent.getAttribute('tabindex') === '-1'),
    ''
  ));

  checks.push(check(
    'Page title names Earthdata Pub',
    /Earthdata Pub/.test(doc.title || ''),
    doc.title || 'Title is empty.'
  ));

  const fakePager = Array.from(doc.querySelectorAll('.pagination a[href="#"]')).filter((el) => !isOurs(el));
  checks.push(check('Pager is not a fake link', fakePager.length === 0, fakePager.length ? list(fakePager, 3) : ''));

  const header = doc.querySelector('div.header');
  checks.push(check(
    'App header has no aria-label',
    !(header && header.hasAttribute('aria-label')),
    ''
  ));

  const emptyHeadings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter((el) => {
    if (skip(el)) return false;
    return !(el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
  });
  checks.push(check('Headings have text', emptyHeadings.length === 0, emptyHeadings.length ? list(emptyHeadings, 3) : ''));

  const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter((el) => !skip(el));
  const h1Count = headings.filter((el) => el.tagName === 'H1').length;
  checks.push(check('One h1', h1Count === 1, h1Count === 1 ? '' : `Found ${h1Count}.`));

  let skippedLevel = '';
  headings.forEach((el, index) => {
    if (index === 0 || skippedLevel) return;
    const level = Number(el.tagName.slice(1));
    const previous = Number(headings[index - 1].tagName.slice(1));
    if (level > previous + 1) skippedLevel = `${headings[index - 1].tagName} then ${el.tagName}: ${snippet(el)}`;
  });
  checks.push(check('Heading levels do not skip', !skippedLevel, skippedLevel));

  const unnamed = Array.from(doc.querySelectorAll('a, button, [role="button"], [role="link"]')).filter((el) => !skip(el) && !accessibleName(el));
  checks.push(check('Links and buttons have a name', unnamed.length === 0, unnamed.length ? list(unnamed, 4) : ''));

  const images = Array.from(doc.querySelectorAll('img')).filter((el) => !isOurs(el) && !isNasa(el) && !el.hasAttribute('alt'));
  checks.push(check('Images have alt text', images.length === 0, images.length ? list(images, 4) : ''));

  const unnamedInputs = Array.from(doc.querySelectorAll('input[type="checkbox"], input[type="radio"]')).filter((el) => {
    if (skip(el)) return false;
    const wrapped = el.closest('label');
    const labelled = el.id && doc.querySelector(`label[for="${el.id}"]`);
    return !accessibleName(el) && !(wrapped && wrapped.innerText.trim()) && !labelled;
  });
  checks.push(check('Checkboxes and radios have a name', unnamedInputs.length === 0, unnamedInputs.length ? list(unnamedInputs, 4) : ''));

  const focus = focusCss(doc);
  checks.push(check(
    'Keyboard focus ring',
    focus.indexOf(':focus-visible') !== -1 && focus.indexOf('solid 3px') !== -1 && focus.indexOf(':focus:not(:focus-visible)') !== -1,
    ''
  ));

  const contrast = contrastFailures(doc, false);
  checks.push(check(
    'Text contrast is at least 4.5:1',
    contrast.length === 0,
    contrast.slice(0, 6).map((item) => `${item.detail}\n${snippet(item.el)}`).join('\n\n')
  ));

  const aaa = contrastFailures(doc, true).filter((item) => item.detail.indexOf('needs 7:1') !== -1);
  checks.push(check(
    'AAA: text contrast is at least 7:1',
    aaa.length === 0,
    aaa.slice(0, 6).map((item) => `${item.detail}\n${snippet(item.el)}`).join('\n\n')
  ));

  const nasaLinks = Array.from(doc.querySelectorAll('a, button')).filter((el) => isNasa(el) && !isHiddenFromAt(el) && !accessibleName(el));
  checks.push(check(
    'Accessibility: NASA header links have a name',
    nasaLinks.length === 0,
    nasaLinks.length ? list(nasaLinks, 4) : ''
  ));

  const rowgroups = Array.from(doc.querySelectorAll('[role="rowgroup"]')).filter((el) => {
    return !isOurs(el) && !isHiddenFromAt(el) && el.querySelector('[role="row"], tr') === null;
  });
  checks.push(check(
    'Accessibility: a row group contains a row',
    rowgroups.length === 0,
    rowgroups.length ? list(rowgroups, 3) : ''
  ));

  const bareSections = Array.from(doc.querySelectorAll('section')).filter((el) => {
    return !isOurs(el) && !isHiddenFromAt(el) && !sectionOwnsHeading(el);
  });
  checks.push(check(
    'Standards: each section has a heading',
    bareSections.length === 0,
    bareSections.length ? list(bareSections, 4) : ''
  ));

  const unsizedImages = Array.from(doc.querySelectorAll('img')).filter((el) => {
    return !isOurs(el) && !isHiddenFromAt(el) && (!el.hasAttribute('width') || !el.hasAttribute('height'));
  });
  checks.push(check(
    'Usability: images have width and height',
    unsizedImages.length === 0,
    unsizedImages.length ? list(unsizedImages, 4) : ''
  ));

  const smallText = [];
  const seenSize = {};
  doc.body.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, button, label, li, td, th, span, caption, div').forEach((el) => {
    if (isOurs(el) || !ownText(el) || isHiddenFromAt(el)) return;
    const style = doc.defaultView.getComputedStyle(el);
    const size = parseFloat(style.fontSize);
    if (!size || size >= 16) return;
    const key = `${size.toFixed(1)}|${el.tagName}`;
    if (seenSize[key]) return;
    seenSize[key] = true;
    smallText.push({ el, detail: `${size.toFixed(1)}px is under 12pt` });
  });
  checks.push(check(
    'Usability: text is at least 12pt',
    smallText.length === 0,
    smallText.slice(0, 6).map((item) => `${item.detail}\n${snippet(item.el)}`).join('\n\n')
  ));

  const shortLists = Array.from(doc.querySelectorAll('select')).filter((el) => {
    return !isOurs(el) && !isHiddenFromAt(el) && el.options.length > 0 && el.options.length <= 6;
  });
  checks.push(check(
    'Usability: dropdowns with 6 or fewer choices',
    shortLists.length === 0,
    shortLists.length ? list(shortLists, 4) : ''
  ));

  const search = doc.querySelector('input[type="search"], [role="search"]');
  checks.push(check(
    'Usability: the page has a search option',
    !!search,
    search ? '' : 'No search field on this screen.'
  ));

  let pathName = '';
  try {
    pathName = doc.location.pathname || '';
  } catch (e) {
    pathName = '';
  }
  checks.push(check(
    'Search: keywords in the URL use dashes',
    pathName.indexOf('_') === -1,
    pathName.indexOf('_') === -1 ? '' : pathName
  ));

  const h1 = headings.filter((el) => el.tagName === 'H1').length;
  checks.push(check(
    'Search: the page has an h1',
    h1 > 0,
    h1 > 0 ? '' : 'Bing wants one h1 before the main content.'
  ));

  return checks;
}

const colorOnly = /^(color|background-color|border-color|border-bottom-color|border-top-color|border-left-color|border-right-color|outline-color|column-rule-color|text-decoration-color|caret-color|fill|stroke)$/;

export function runStyleChecks (doc) {
  const visited = [];
  const opacity = [];
  const unknown = [];
  eachRule(doc, (rule) => {
    if (!rule.style) return;
    if (rule.selectorText && rule.selectorText.indexOf(':visited') !== -1) {
      for (let i = 0; i < rule.style.length; i += 1) {
        const prop = rule.style[i];
        if (!colorOnly.test(prop)) visited.push(`${rule.selectorText} { ${prop} }`);
      }
    }
    const opacityValue = rule.style.getPropertyValue('opacity');
    if (opacityValue && opacityValue.indexOf('%') !== -1) {
      opacity.push(rule.selectorText || rule.cssText.slice(0, 120));
    }
    ['rx', 'ry'].forEach((prop) => {
      if (rule.style.getPropertyValue(prop)) unknown.push(`${prop} on ${rule.selectorText || 'a style rule'}`);
    });
    const transform = rule.style.getPropertyValue('transform');
    if (transform && transform.split('(').length !== transform.split(')').length) {
      unknown.push(`transform: ${transform.slice(0, 80)}`);
    }
  });
  return [
    check('Compatibility: :visited changes color only', visited.length === 0, visited.slice(0, 6).join('\n')),
    check('Compatibility: opacity uses a number, not a percent', opacity.length === 0, opacity.slice(0, 6).join('\n')),
    check('Standards: stylesheet properties are valid', unknown.length === 0, unknown.slice(0, 6).join('\n'))
  ];
}

export async function runSameOriginLinkCheck (doc, seen) {
  const todo = [];
  Array.from(doc.querySelectorAll('a[href]')).forEach((el) => {
    if (isOurs(el)) return;
    const href = el.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(href)) return;
    let url;
    try {
      url = new URL(href, window.location.origin);
    } catch (e) {
      return;
    }
    if (url.origin !== window.location.origin) return;
    if (/\/logout(\/|$)/.test(url.pathname)) return;
    const path = `${url.pathname}${url.search}`;
    if (seen.has(path) || todo.length >= 12) return;
    seen.add(path);
    todo.push(path);
  });
  const broken = [];
  await Promise.all(todo.map(async (path) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(path, { method: 'GET', credentials: 'same-origin', signal: controller.signal });
      if (response.status >= 400) broken.push(`${response.status} ${path}`);
    } catch (e) {
      broken.push(`no response ${path}`);
    } finally {
      clearTimeout(timer);
    }
  }));
  return check('Errors: links on this site respond', broken.length === 0, broken.join('\n'));
}

export async function runSitemapCheck () {
  try {
    const response = await fetch('/sitemap.xml', { method: 'GET' });
    const text = response.ok ? await response.text() : '';
    const found = response.ok && /<urlset|<sitemapindex/i.test(text);
    return check('Search: sitemap.xml is present', found, found ? '' : 'No sitemap at /sitemap.xml.');
  } catch (e) {
    return check('Search: sitemap.xml is present', false, 'No sitemap at /sitemap.xml.');
  }
}

export default runA11yReport;
