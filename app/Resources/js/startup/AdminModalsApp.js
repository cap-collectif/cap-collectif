// @flow
import * as React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import AdminModals from '../components/Admin/AdminModals';

export default (props: Object) =>
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <AdminModals {...props} />
    </IntlProvider>
  </Provider>;
