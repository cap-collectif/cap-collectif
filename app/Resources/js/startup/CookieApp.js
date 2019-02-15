// @flow
import * as React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import CookieModal from "../components/StaticPage/CookieModal";

export default (props: Object) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <CookieModal {...props} />
    </IntlProvider>
  </Provider>
);
