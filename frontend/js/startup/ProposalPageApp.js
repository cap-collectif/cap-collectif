// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/Proposal/Page/ProposalPage';

const ProposalPage = lazy(() =>
  import(/* webpackChunkName: "ProposalPage" */ '~/components/Proposal/Page/ProposalPage'),
);

export default (props: Props) => (
  <Suspense fallback={null}>
    <Providers>
      <ProposalPage {...props} />
    </Providers>
  </Suspense>
);
