// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const AdminProposalFormList = lazy(() =>
  import(
    /* webpackChunkName: "AdminProposalFormList" */ '~/components/Admin/Project/ProposalFormList/ProposalFormListQuery'
  ),
);

type Props = {|
  +isAdmin: boolean,
|};

export default ({ isAdmin }: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <AdminProposalFormList isAdmin={isAdmin} />
    </Providers>
  </Suspense>
);
