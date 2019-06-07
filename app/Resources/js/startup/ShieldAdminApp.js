// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ShieldAdminPage from '../components/Admin/ShieldAdminPage';

export default () => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ShieldAdminPage />
    </IntlProvider>
  </Provider>
);
