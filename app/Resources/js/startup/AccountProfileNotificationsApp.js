// @flow
import * as React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import NotificationsBox from '../components/User/Profile/NotificationsBox';

export default (props: Object) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <NotificationsBox {...props} />
    </IntlProvider>
  </Provider>
);
