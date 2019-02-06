import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import AdminExportButton from '../components/Event/Admin/AdminExportButton';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <AdminExportButton {...props} />
    </IntlProvider>
  </Provider>
);
