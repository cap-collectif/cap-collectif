// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ProposalStepPage = lazy(() => import('~/components/Page/ProposalStepPage'));

type Props = {|
  +stepId: string,
  +count: number,
|};

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      {/* $FlowFixMe  */}
      <ProposalStepPage {...props} />
    </Providers>
  </Suspense>
);
