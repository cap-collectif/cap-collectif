// @flow
import React, { lazy, Suspense } from 'react';
import type { Props } from '~/components/Proposal/Admin/ProposalAdminPage';
import Loader from '~ui/FeedbacksIndicators/Loader';
import AlertBoxApp from '~/startup/AlertBoxApp';

const ProposalAdminPage = lazy(() => import(/* webpackChunkName: "ProposalAdminPage" */ '~/components/Proposal/Admin/ProposalAdminPage'));

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <AlertBoxApp>
      <ProposalAdminPage {...props} />
    </AlertBoxApp>
  </Suspense>
);
