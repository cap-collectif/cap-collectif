// @flow
import * as React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import SSOSwitchUserPage from '../components/Page/SSOSwitchUserPage';

export default (props: { user: ?{| username: string |} }) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <SSOSwitchUserPage {...props} />
    </IntlProvider>
  </Provider>
);
