// @flow
import * as React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import EmailNotConfirmedAlert from '../components/User/EmailNotConfirmedAlert';
import NewEmailNotConfirmedAlert from '../components/User/NewEmailNotConfirmedAlert';

export default (props: Object) => (
  <span>
    <Provider store={ReactOnRails.getStore('appStore')}>
      <IntlProvider>
        <EmailNotConfirmedAlert {...props} />
      </IntlProvider>
    </Provider>
    <Provider store={ReactOnRails.getStore('appStore')}>
      <IntlProvider>
        <NewEmailNotConfirmedAlert {...props} />
      </IntlProvider>
    </Provider>
  </span>
);
