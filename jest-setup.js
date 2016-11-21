import { jsdom } from 'jsdom';

const exposedProperties = ['window', 'navigator', 'document'];

global.document = jsdom('');
global.window = document.defaultView;
global.window.__SERVER__ = false;
global.$ = require('jquery')(window);

Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

import 'babel-polyfill';

global.navigator = {
  userAgent: 'node.js',
};

const throwError = (warning) => {
  // if (!/You are manually calling|Unknown props/.test(warning)) { // fix warnings and remove this
  //   throw new Error(warning);
  // }
};
console.error = throwError; // eslint-disable-line no-console
console.warn = throwError; // eslint-disable-line no-console
