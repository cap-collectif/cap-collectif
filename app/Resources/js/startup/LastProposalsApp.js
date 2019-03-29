// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import LastProposals, { type Props } from '../components/HomePage/LastProposals';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <LastProposals {...props} />
    </IntlProvider>
  </Provider>
);
