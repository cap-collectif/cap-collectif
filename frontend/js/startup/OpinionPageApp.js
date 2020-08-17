// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/Opinion/OpinionPage';
import Loader from '~ui/FeedbacksIndicators/Loader';

const OpinionPage = lazy(() => import('~/components/Opinion/OpinionPage'));

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <OpinionPage {...props} />
    </Providers>
  </Suspense>
);
