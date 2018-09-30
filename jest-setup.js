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


global.window.__SERVER__ = false;

const throwError = (warning) => {
  if (!/Shallow renderer has been moved to react-test-renderer|Accessing createClass via the main React package is deprecated|Accessing PropTypes via the main React package is deprecated|node-uuid: crypto not usable|You are manually calling|Unknown props/.test(warning)) { // fix warnings and remove this
    throw new Error(warning);
  }
};
// $FlowFixMe
console.error = throwError; // eslint-disable-line no-console
// $FlowFixMe
console.warn = throwError; // eslint-disable-line no-console
