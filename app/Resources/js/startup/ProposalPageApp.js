import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ProposalPage from '../components/Proposal/Page/ProposalPage';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProposalPage {...props} />
    </IntlProvider>
  </Provider>
);
