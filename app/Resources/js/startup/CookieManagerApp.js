// @flow
import * as React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import CookieManagerModal from '../components/StaticPage/CookieManagerModal';

export default (props: Object) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <CookieManagerModal {...props} />
    </IntlProvider>
  </Provider>
);
