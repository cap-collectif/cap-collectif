// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/Source/SourcePage';
import Loader from '~ui/FeedbacksIndicators/Loader';

const SourcePage = lazy(() =>
  import(/* webpackChunkName: "SourcePage" */ '~/components/Source/SourcePage'),
);

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers designSystem>
      <SourcePage {...props} />
    </Providers>
  </Suspense>
);
