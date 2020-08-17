// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/Proposal/Page/ProposalPage';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ProposalPage = lazy(() => import('~/components/Proposal/Page/ProposalPage'));

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ProposalPage {...props} />
    </Providers>
  </Suspense>
);
