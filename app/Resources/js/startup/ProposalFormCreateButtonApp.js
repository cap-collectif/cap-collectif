import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import ProposalFormCreateButton from '../components/ProposalForm/ProposalFormCreateButton';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProposalFormCreateButton {...props} />
    </IntlProvider>
  </Provider>
);
