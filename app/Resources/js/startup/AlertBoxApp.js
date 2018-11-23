import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import AlertBox from '../components/Alert/AlertBox';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <div id="global-alert-box">
        <AlertBox {...props} />
      </div>
    </IntlProvider>
  </Provider>
);
