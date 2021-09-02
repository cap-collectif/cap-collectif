// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/Section/SectionListPage';
import Loader from '~ui/FeedbacksIndicators/Loader';

const SectionListPage = lazy(() =>
  import(/* webpackChunkName: "SectionListPage" */ '~/components/Section/SectionListPage'),
);

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <SectionListPage {...props} />
    </Providers>
  </Suspense>
);
