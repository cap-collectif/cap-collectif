// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import RegistrationAdminPage, { type Props } from '../components/Admin/RegistrationAdminPage';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <RegistrationAdminPage {...props} />
    </IntlProvider>
  </Provider>
);
