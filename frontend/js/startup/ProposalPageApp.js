// @flow
import React from 'react';
import Providers from './Providers';
import ProposalPage, { type Props } from '../components/Proposal/Page/ProposalPage';

export default (props: Props) => (
  <Providers>
    <ProposalPage {...props} />
  </Providers>
);
