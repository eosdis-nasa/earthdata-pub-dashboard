import React from 'react';
import ReactDOM from 'react-dom';
import { isSafari } from 'react-device-detect'

import './css/main.scss';
import './public/favicon.svg';

import App from '../src/js/App';
import UnsupportedBrowser from './js/components/unsupportedBrowser';

// Add a const here to check for whether the user is using a valid browser
// This is a variable because it will allow for additonal browser checks in the future if necessary
const validBrowser = !isSafari

ReactDOM.render( validBrowser ? <App />: <UnsupportedBrowser />, document.getElementById('site-canvas'));
