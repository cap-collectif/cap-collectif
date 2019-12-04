// @flow
import * as React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import Accordion from '../components/Ui/Accordion/Accordion';

export default (props: Object) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <Accordion {...props} />
    </IntlProvider>
  </Provider>
);
