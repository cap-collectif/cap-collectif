// @flow
import * as React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import Calendar from '../components/Ui/Calendar/Calendar';

export default (props: Object) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <Calendar {...props} />
    </IntlProvider>
  </Provider>
);
