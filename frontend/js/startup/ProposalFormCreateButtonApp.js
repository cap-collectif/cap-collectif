// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/ProposalForm/ProposalFormCreateButton';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ProposalFormCreateButton = lazy(() =>
  import(/* webpackChunkName: "ProposalFormCreateButton" */ '~/components/ProposalForm/ProposalFormCreateButton'),
);

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ProposalFormCreateButton {...props} />
    </Providers>
  </Suspense>
);
