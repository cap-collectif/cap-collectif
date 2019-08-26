// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ProposalAdminPage, { type Props } from '../components/Proposal/Admin/ProposalAdminPage';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProposalAdminPage {...props} />
    </IntlProvider>
  </Provider>
);
