import 'babel-polyfill';
import moment from 'moment-timezone';
import 'moment/locale/fr';
moment.locale('fr');
moment.tz.setDefault("Europe/Paris");

global.$ = require('jquery')(window);

global.window.__SERVER__ = false;

const throwError = (warning) => {
  if (!/node-uuid: crypto not usable|You are manually calling|Unknown props/.test(warning)) { // fix warnings and remove this
    throw new Error(warning);
  }
};
console.error = throwError; // eslint-disable-line no-console
console.warn = throwError; // eslint-disable-line no-console

global.intlMock = {
  now: () => null,
  formatHTMLMessage: message => message,
  formatPlural: message => message,
  formatNumber: message => message,
  formatRelative: message => message,
  formatTime: message => message,
  formatDate: message => message,
  formatMessage: message => message.id,
}
