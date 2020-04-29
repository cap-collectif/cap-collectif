// @flow
import React from 'react';
import Providers from './Providers';
import ProposalAdminPage, { type Props } from '../components/Proposal/Admin/ProposalAdminPage';

export default (props: Props) => (
  <Providers>
    <ProposalAdminPage {...props} />
  </Providers>
);
