// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import LocaleAdminPage from '../components/Admin/Locale/LocaleAdminPage';

export default (props: {}) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <LocaleAdminPage {...props} />
    </IntlProvider>
  </Provider>
);
