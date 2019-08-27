import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ProposalFormAdminPage from '../components/ProposalForm/ProposalFormAdminPage';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProposalFormAdminPage {...props} />
    </IntlProvider>
  </Provider>
);
