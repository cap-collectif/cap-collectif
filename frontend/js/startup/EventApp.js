// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import EventPage from '../components/Event/EventPage';

export default (props: Object) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <EventPage {...props} />
    </IntlProvider>
  </Provider>
);
