// @flow
import * as React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import SSOSwitchUserPage from '../components/Page/SSOSwitchUserPage';

export default (props: { destination: ?string, user: ?{| username: string |} }) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      {/** $FlowFixMe redux overrides user type, incomprehensible */}
      <SSOSwitchUserPage {...props} />
    </IntlProvider>
  </Provider>
);
