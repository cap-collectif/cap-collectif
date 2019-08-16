// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import RegistrationAdminPage from '../components/Admin/RegistrationAdminPage';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <RegistrationAdminPage {...props} />
    </IntlProvider>
  </Provider>
);
