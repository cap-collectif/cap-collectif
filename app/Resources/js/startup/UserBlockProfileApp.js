// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import UserBlockProfile, { type Props } from '../components/Ui/BackOffice/UserBlockProfile';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <UserBlockProfile {...props} />
    </IntlProvider>
  </Provider>
);
