// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import EventListProfile from '../components/Event/Profile/EventListProfile';

type Props = {
  userId?: string,
  isAuthenticated?: boolean,
};

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <EventListProfile {...props} />
    </IntlProvider>
  </Provider>
);
