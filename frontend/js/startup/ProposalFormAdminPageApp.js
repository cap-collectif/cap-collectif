// @flow
import React from 'react';
import Providers from './Providers';
import ProposalFormAdminPage, {
  type Props,
} from '../components/ProposalForm/ProposalFormAdminPage';

export default (props: Props) => (
  <Providers>
    <ProposalFormAdminPage {...props} />
  </Providers>
);
