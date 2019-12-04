// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import AlertBox, { type Props } from '../components/Alert/AlertBox';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <div id="global-alert-box">
        <AlertBox {...props} />
      </div>
    </IntlProvider>
  </Provider>
);
