import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import GroupAdminPage from '../components/Group/Admin/GroupAdminPage';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <GroupAdminPage {...props} />
    </IntlProvider>
  </Provider>
);
