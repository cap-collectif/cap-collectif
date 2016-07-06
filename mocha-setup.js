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

global.navigator = {
  userAgent: 'node.js',
};

const throwError = (warning) => {
  throw new Error(warning);
};
console.error = throwError; // eslint-disable-line no-console
console.warn = throwError; // eslint-disable-line no-console
