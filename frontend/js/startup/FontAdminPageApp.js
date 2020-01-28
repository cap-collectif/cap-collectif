// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import FontAdminPage from '~/components/Admin/Font/FontAdminPage';

export default () => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <FontAdminPage />
    </IntlProvider>
  </Provider>
);
