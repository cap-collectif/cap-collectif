import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import ProposalAdminPage from '../components/Proposal/Admin/ProposalAdminPage';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProposalAdminPage {...props} />
    </IntlProvider>
  </Provider>
);
