// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ContactAdminPage from '../components/Admin/Contact/ContactAdminPage';

export default (props: Object) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ContactAdminPage {...props} />
    </IntlProvider>
  </Provider>
);
