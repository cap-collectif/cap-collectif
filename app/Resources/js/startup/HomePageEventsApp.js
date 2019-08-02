// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import HomePageEvents from '../components/HomePage/HomePageEvents';

type Props = {|
  limit: number,
|};

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <HomePageEvents {...props} />
    </IntlProvider>
  </Provider>
);
