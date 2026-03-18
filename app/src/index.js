import React from 'react';
import ReactDOM from 'react-dom';

import './css/main.scss';
import './public/favicon.svg';

import App from '../src/js/App';
import UnsupportedBrowser from './js/components/unsupportedBrowser';

const isSafari = () => {
  if (typeof navigator === 'undefined') return false;

  const ua = navigator.userAgent;
  
  // Check for Safari-specific identifiers in the user agent
  const hasSafariString = /Safari/i.test(ua) && /AppleWebKit/i.test(ua);

  // Exclude non-Safari browsers that may also include "Safari" in the UA
  const isOtherBrowser = /Chrome|CriOS|Edg|OPR|FxiOS|Android/i.test(ua);

  // Supplemental feature check: Safari exposes a unique global `window.safari` object
  const isSafariObject = typeof window !== 'undefined' && !!window.safari;

  return (hasSafariString && !isOtherBrowser) || isSafariObject;
};


// Add a const here to check for whether the user is using a valid browser
// This is a variable because it will allow for additonal browser checks in the future if necessary
const validBrowser = !isSafari();

ReactDOM.render( validBrowser ? <App />: <UnsupportedBrowser />, document.getElementById('site-canvas'));
