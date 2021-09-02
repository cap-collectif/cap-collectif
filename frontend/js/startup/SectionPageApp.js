// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/Consultation/SectionPage';
import Loader from '~ui/FeedbacksIndicators/Loader';

const SectionPage = lazy(() =>
  import(/* webpackChunkName: "SectionPage" */ '~/components/Consultation/SectionPage'),
);

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <SectionPage {...props} />
    </Providers>
  </Suspense>
);
