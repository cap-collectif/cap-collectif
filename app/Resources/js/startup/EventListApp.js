// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import EventListProfil from '../components/Event/Profil/EventListProfil';

type Props = {
  userId?: string,
  isAuthenticated?: boolean,
};

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <EventListProfil {...props} />
    </IntlProvider>
  </Provider>
);
