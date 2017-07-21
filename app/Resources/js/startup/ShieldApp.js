// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import Shield from '../components/Page/ShieldPage';

export default (props: Object) =>
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <Shield {...props} />
    </IntlProvider>
  </Provider>;
