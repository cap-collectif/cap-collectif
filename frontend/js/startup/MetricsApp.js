// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/Section/SectionContainer';
import Loader from '~ui/FeedbacksIndicators/Loader';

const SectionContainer = lazy(() => import(/* webpackChunkName: "SectionContainer" */ '~/components/Section/SectionContainer'));

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <SectionContainer {...props} />
    </Providers>
  </Suspense>
);
