// @flow
import * as React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import AccountBox from '../components/User/Profile/AccountBox';

export default (props: Object) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <AccountBox {...props} />
    </IntlProvider>
  </Provider>
);
