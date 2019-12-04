// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ReplyPage, { type Props } from '../components/Reply/Profile/ReplyPage';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ReplyPage {...props} />
    </IntlProvider>
  </Provider>
);
