import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import GroupCreateButton from '../components/Group/GroupCreateButton';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <GroupCreateButton {...props} />
    </IntlProvider>
  </Provider>
);
