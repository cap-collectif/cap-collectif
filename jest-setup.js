global.window.__SERVER__ = false;
global.$ = require('jquery')(window);

const throwError = warning => {
  if (!/node-uuid: crypto not usable|You are manually calling|Unknown props/.test(warning)) { // fix warnings and remove this
    throw new Error(warning);
  }
};
console.error = throwError; // eslint-disable-line no-console
console.warn = throwError; // eslint-disable-line no-console
