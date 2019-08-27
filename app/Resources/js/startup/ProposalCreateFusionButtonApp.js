import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ProposalCreateFusionButton from '../components/Proposal/Create/ProposalCreateFusionButton';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProposalCreateFusionButton {...props} />
    </IntlProvider>
  </Provider>
);
