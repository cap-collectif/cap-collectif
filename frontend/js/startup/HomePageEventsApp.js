// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import HomePageEvents, { type Props } from '../components/HomePage/HomePageEvents';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <HomePageEvents {...props} />
    </IntlProvider>
  </Provider>
);
