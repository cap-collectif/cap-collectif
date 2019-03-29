import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import UserAdminCreateButton from '../components/User/Admin/UserAdminCreateButton';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <UserAdminCreateButton {...props} />
    </IntlProvider>
  </Provider>
);
