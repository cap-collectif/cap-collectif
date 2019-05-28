// @flow
import * as React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import CookieContent from '../components/StaticPage/CookieContent';

export default (props: Object) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <CookieContent {...props} />
    </IntlProvider>
  </Provider>
);
