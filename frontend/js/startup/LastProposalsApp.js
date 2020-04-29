// @flow
import React from 'react';
import Providers from './Providers';
import LastProposals, { type Props } from '../components/HomePage/LastProposals';

export default (props: Props) => (
  <Providers>
      <LastProposals {...props} />
    </Providers>
);
