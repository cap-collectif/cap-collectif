var jsdom = require('jsdom').jsdom;

var exposedProperties = ['window', 'navigator', 'document'];

global.document = jsdom('');
global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

global.navigator = {
  userAgent: 'node.js'
};

const error = console.error;
console.error = function(warning) {
  if (/(Invalid prop|Failed propType|Failed Context Types)/.test(warning)) {
    throw new Error(warning);
  }
  error.apply(console, arguments);
};
