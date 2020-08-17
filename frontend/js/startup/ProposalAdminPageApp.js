// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/Proposal/Admin/ProposalAdminPage';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ProposalAdminPage = lazy(() => import('~/components/Proposal/Admin/ProposalAdminPage'));

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ProposalAdminPage {...props} />
    </Providers>
  </Suspense>
);
