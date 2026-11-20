'use strict';
import runA11yReport, { runSameOriginLinkCheck, runSitemapCheck, runStyleChecks } from './checks';
import pages from './pages';

const listeners = new Set();

let state = {
  status: '',
  results: [],
  running: false,
  runningPath: '',
  finished: false
};

function publish (next) {
  state = next;
  listeners.forEach((listener) => listener(state));
}

export function getA11yScan () {
  return state;
}

export function subscribeA11yScan (listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function loadFrame (iframe, path) {
  return new Promise((resolve) => {
    const started = Date.now();
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      try {
        resolve(iframe.contentDocument);
      } catch (e) {
        resolve(null);
      }
    };
    const pathName = path.split('?')[0];
    let sawAuthAt = 0;
    const tick = () => {
      if (settled) return;
      let doc;
      let href = '';
      try {
        doc = iframe.contentDocument;
        href = iframe.contentWindow.location.pathname;
      } catch (e) {
        finish();
        return;
      }
      const main = doc && doc.querySelector('main');
      const busy = doc && doc.querySelector('.app-loading, .brand-loading');
      if (main && !busy && href === pathName) {
        finish();
        return;
      }
      if (main && !busy && href === '/auth' && pathName !== '/auth') {
        if (!sawAuthAt) sawAuthAt = Date.now();
        if (Date.now() - sawAuthAt > 2500) {
          finish();
          return;
        }
      } else {
        sawAuthAt = 0;
      }
      if (Date.now() - started > 20000) finish();
      else setTimeout(tick, 300);
    };
    iframe.onload = () => setTimeout(tick, 500);
    iframe.src = path;
    setTimeout(tick, 500);
  });
}

async function checksFor (iframe, doc, path, seenLinks) {
  if (!doc || !doc.body) {
    return [{ title: 'Page opened', pass: false, detail: 'This screen could not be read.' }];
  }
  let landed = '';
  try {
    landed = iframe.contentWindow.location.pathname;
  } catch (e) {
    landed = '';
  }
  const pathName = path.split('?')[0];
  if (landed === '/auth' && pathName !== '/auth') {
    return [{ title: 'Sign in required', pass: false, detail: 'This screen opened the sign-in page.' }];
  }
  const checks = runA11yReport(doc);
  checks.push(await runSameOriginLinkCheck(doc, seenLinks));
  return checks;
}

function restoreRedirect (saved) {
  if (saved) localStorage.setItem('redirectAfterLogin', saved);
  else localStorage.removeItem('redirectAfterLogin');
}

export function startA11yScan (force) {
  if (state.running) return;
  if (state.finished && !force) return;

  const savedRedirect = localStorage.getItem('redirectAfterLogin');
  const onStorage = (event) => {
    if (event.key === 'redirectAfterLogin' || event.key === 'auth-token') restoreRedirect(savedRedirect);
  };
  window.__edpub508 = true;
  window.addEventListener('storage', onStorage);
  publish({ status: 'Starting', results: [], running: true, runningPath: '', finished: false });

  const iframe = document.createElement('iframe');
  iframe.className = 'dev-a11y-page__frame';
  iframe.setAttribute('title', '508 check frame');
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const scan = async () => {
    const found = [];
    const seenLinks = new Set();
    let styleChecks = null;
    for (let i = 0; i < pages.length; i += 1) {
      const [name, path] = pages[i];
      publish({
        status: `Checking ${i + 1} of ${pages.length}: ${name}`,
        results: found.slice(),
        running: true,
        runningPath: path,
        finished: false
      });
      const doc = await loadFrame(iframe, path);
      restoreRedirect(savedRedirect);
      if (!styleChecks && doc && doc.body) styleChecks = runStyleChecks(doc);
      found.push({ name, path, checks: await checksFor(iframe, doc, path, seenLinks) });
    }
    const siteChecks = styleChecks || [];
    siteChecks.push(await runSitemapCheck());
    found.push({ name: 'Styles and sitemap', path: '/sitemap.xml', checks: siteChecks });
    iframe.remove();
    window.removeEventListener('storage', onStorage);
    restoreRedirect(savedRedirect);
    window.__edpub508 = false;
    publish({
      status: '',
      results: found,
      running: false,
      runningPath: '',
      finished: true
    });
  };

  scan();
}

export function startA11yPage (name, path) {
  if (state.running) return;

  const savedRedirect = localStorage.getItem('redirectAfterLogin');
  const onStorage = (event) => {
    if (event.key === 'redirectAfterLogin' || event.key === 'auth-token') restoreRedirect(savedRedirect);
  };
  const previous = state.results.slice();
  window.__edpub508 = true;
  window.addEventListener('storage', onStorage);
  publish({
    status: `Checking ${name}`,
    results: previous,
    running: true,
    runningPath: path,
    finished: false
  });

  const finish = (checks) => {
    const results = previous.slice();
    const index = results.findIndex((item) => item.path === path);
    const next = { name, path, checks };
    if (index === -1) results.push(next);
    else results[index] = next;
    window.removeEventListener('storage', onStorage);
    restoreRedirect(savedRedirect);
    window.__edpub508 = false;
    publish({
      status: '',
      results,
      running: false,
      runningPath: '',
      finished: true
    });
  };

  if (path === '/sitemap.xml') {
    const runSite = async () => {
      const checks = runStyleChecks(document);
      checks.push(await runSitemapCheck());
      finish(checks);
    };
    runSite();
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.className = 'dev-a11y-page__frame';
  iframe.setAttribute('title', '508 check frame');
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const runPage = async () => {
    const doc = await loadFrame(iframe, path);
    restoreRedirect(savedRedirect);
    const checks = await checksFor(iframe, doc, path, new Set());
    iframe.remove();
    finish(checks);
  };
  runPage();
}
