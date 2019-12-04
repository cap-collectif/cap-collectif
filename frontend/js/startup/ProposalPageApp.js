// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ProposalPage, { type Props } from '../components/Proposal/Page/ProposalPage';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProposalPage {...props} />
    </IntlProvider>
  </Provider>
);
