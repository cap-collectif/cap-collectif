// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import { GroupAdminPage, type Props } from '../components/Group/Admin/GroupAdminPage';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <GroupAdminPage {...props} />
    </IntlProvider>
  </Provider>
);
