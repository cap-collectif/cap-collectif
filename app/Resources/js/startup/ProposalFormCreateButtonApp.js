// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ProposalFormCreateButton from '../components/ProposalForm/ProposalFormCreateButton';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProposalFormCreateButton {...props} />
    </IntlProvider>
  </Provider>
);
