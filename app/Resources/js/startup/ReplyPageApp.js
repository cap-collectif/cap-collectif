import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ReplyPage from '../components/Reply/ReplyPage';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ReplyPage {...props} />
    </IntlProvider>
  </Provider>
);
