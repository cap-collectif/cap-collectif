// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import MapAdminPage from '../components/User/Admin/MapAdminPage';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <MapAdminPage {...props} />
    </IntlProvider>
  </Provider>
);
