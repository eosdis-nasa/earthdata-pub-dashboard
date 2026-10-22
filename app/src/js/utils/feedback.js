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

export function openFeedbackForm (e) {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }
  ensureFeedbackScrollIntoView();
  if (window.feedback && typeof window.feedback.showForm === 'function') {
    window.feedback.showForm();
  }
}
