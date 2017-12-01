/* eslint-env jest */
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

global.formMock = {
  anyTouched: false,
  array: {
    insert: jest.fn(),
    move: jest.fn(),
    pop: jest.fn(),
    push: jest.fn(),
    remove: jest.fn(),
    removeAll: jest.fn(),
    shift: jest.fn(),
    splice: jest.fn(),
    swap: jest.fn(),
    unshift: jest.fn()
  },
  asyncValidate: jest.fn(),
  asyncValidating: false,
  autofill: jest.fn(),
  blur: jest.fn(),
  change: jest.fn(),
  clearAsyncError: jest.fn(),
  clearSubmit: jest.fn(),
  destroy: jest.fn(),
  dirty: false,
  dispatch: jest.fn(),
  error: null,
  form: "formName",
  handleSubmit: jest.fn(),
  initialize: jest.fn(),
  initialized: true,
  initialValues: {},
  invalid: false,
  pristine: true,
  reset: jest.fn(),
  submitting: false,
  submitFailed: false,
  submitSucceeded: false,
  touch: jest.fn(),
  untouch: jest.fn(),
  valid: true,
  warning: null
}
