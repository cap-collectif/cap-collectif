/* eslint-env jest */
import 'babel-polyfill';
import 'whatwg-fetch';

import $ from 'jquery';
// $FlowFixMe
import moment from 'moment-timezone';
// $FlowFixMe
import 'moment/locale/fr';

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

moment.locale('fr');
moment.tz.setDefault("Europe/Paris");

// $FlowFixMe
global.$ = require('jquery')(window);
// $FlowFixMe
global.$ = $;
// $FlowFixMe
global.jQuery = $;

global.Cookies = {
  getJSON: () => ( '' ),
  set:() => ('')
};

global.Modernizr = {
  intl: true
}

global.window.__SERVER__ = false;

const throwError = (warning) => {
    throw new Error(warning);
};
// $FlowFixMe
console.error = throwError; // eslint-disable-line no-console
// $FlowFixMe
console.warn = throwError; // eslint-disable-line no-console
