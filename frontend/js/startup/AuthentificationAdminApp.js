// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import AuthentificationAdminPage from '../components/Admin/Authentification/AuthentificationAdminPage';

export default () => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <AuthentificationAdminPage />
    </IntlProvider>
  </Provider>
);
