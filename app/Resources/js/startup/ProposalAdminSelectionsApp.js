import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import ProposalAdminSelections from '../components/Proposal/Admin/ProposalAdminSelections';

export default props =>
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProposalAdminSelections {...props} />
    </IntlProvider>
  </Provider>;
