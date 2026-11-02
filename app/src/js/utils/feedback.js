'use strict';

/**
 * Earthdata FBM renders the form near the top of the document.
 * Wrap showForm so any entry point (footer, left Tophat tab, Help) scrolls it into view.
 */
export function ensureFeedbackScrollIntoView () {
  if (!window.feedback || typeof window.feedback.showForm !== 'function') {
    return;
  }
  if (window.feedback.__edpubScrollWrapped) {
    return;
  }

  const originalShowForm = window.feedback.showForm.bind(window.feedback);
  window.feedback.showForm = (...args) => {
    const result = originalShowForm(...args);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return result;
  };
  window.feedback.__edpubScrollWrapped = true;
}

const REFERENCE_ID = /^EDP-[0-9A-F]{8}$/;
const SAFE_NAME = /^[A-Za-z][A-Za-z0-9]{0,40}$/;

/**
 * Subject for a crash report. Only a generated reference id is allowed through.
 */
export function crashReportSubject (referenceId) {
  if (typeof referenceId !== 'string' || !REFERENCE_ID.test(referenceId)) {
    return 'Earthdata Pub problem';
  }
  return `Earthdata Pub problem ${referenceId}`;
}

function safePage (page) {
  if (typeof page !== 'string' || !page.startsWith('/')) return '/';
  if (/[?#\s]/.test(page)) return '/';
  return page.slice(0, 200);
}

function safeName (value) {
  return typeof value === 'string' && SAFE_NAME.test(value) ? value : '';
}

function safeTime (value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
    ? value.slice(0, 19) + 'Z'
    : '';
}

/**
 * What the Feedback form is allowed to receive.
 * Page path has no query string. Names are a single word.
 * Error text, stacks, tokens, and form answers are left out.
 */
export function crashReportPayload (referenceId, context) {
  const info = context || {};
  const id = typeof referenceId === 'string' && REFERENCE_ID.test(referenceId) ? referenceId : '';
  const page = safePage(info.page);
  const errorName = safeName(info.errorName);
  const component = safeName(info.component);
  const when = safeTime(info.when);
  const details = [
    'The page stopped loading, so I opened this report.',
    '',
    id ? `Reference: ${id}` : 'Reference: unavailable',
    `Page: ${page}`,
    when ? `Time: ${when}` : '',
    '',
    'What I was doing:',
    ''
  ].filter((line, index, lines) => line !== '' || lines[index - 1] !== '').join('\n');
  const metadata = { page };
  if (id) metadata.referenceId = id;
  if (errorName) metadata.errorName = errorName;
  if (component) metadata.component = component;
  if (when) metadata.time = when;
  return {
    subject: crashReportSubject(referenceId),
    details,
    metadata
  };
}

export function componentNameFromStack (errorInfo) {
  const stack = errorInfo && typeof errorInfo.componentStack === 'string' ? errorInfo.componentStack : '';
  const match = stack.match(/\b(?:in|at) ([A-Z][A-Za-z0-9]{0,40})\b/);
  return match ? match[1] : '';
}

function feedbackOptions (options) {
  if (!options || typeof options !== 'object') return null;
  const payload = {};
  if (typeof options.subject === 'string' && options.subject) payload.subject = options.subject;
  if (typeof options.details === 'string' && options.details) payload.details = options.details;
  if (options.metadata && typeof options.metadata === 'object') payload.metadata = options.metadata;
  return Object.keys(payload).length ? payload : null;
}

function showFeedbackForm (options) {
  ensureFeedbackScrollIntoView();
  if (!window.feedback || typeof window.feedback.showForm !== 'function') {
    return false;
  }
  const payload = feedbackOptions(options);
  if (payload) {
    window.feedback.showForm(payload);
  } else {
    window.feedback.showForm();
  }
  return true;
}

export function openFeedbackForm (e, options) {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }
  if (showFeedbackForm(options)) {
    return true;
  }
  const script = document.getElementById('feedback-script');
  if (script) {
    script.addEventListener('load', () => showFeedbackForm(options), { once: true });
  }
  return false;
}
