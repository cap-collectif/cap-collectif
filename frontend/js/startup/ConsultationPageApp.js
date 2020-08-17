// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { OwnProps as Props } from '~/components/Consultation/ConsultationPropositionBox';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ConsultationPropositionBox = lazy(() =>
  import('~/components/Consultation/ConsultationPropositionBox'),
);

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ConsultationPropositionBox {...props} />
    </Providers>
  </Suspense>
);
