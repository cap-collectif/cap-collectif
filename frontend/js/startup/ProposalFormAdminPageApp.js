// @flow
import React from 'react';
import Providers from './Providers';
import ProposalFormAdminPage, {
  type Props,
} from '../components/ProposalForm/ProposalFormAdminPage';
import AlertBoxApp from '~/startup/AlertBoxApp';

export default (props: Props) => (
  <Providers>
    <AlertBoxApp />
    <ProposalFormAdminPage {...props} />
  </Providers>
);
