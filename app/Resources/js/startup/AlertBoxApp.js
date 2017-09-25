import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import AlertBox from '../components/Alert/AlertBox';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <AlertBox {...props} />
    </IntlProvider>
  </Provider>
);
