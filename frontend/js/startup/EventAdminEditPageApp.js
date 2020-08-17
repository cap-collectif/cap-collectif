// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/Event/Admin/EventAdmin';
import Loader from '~ui/FeedbacksIndicators/Loader';

const EventAdmin = lazy(() => import('~/components/Event/Admin/EventAdmin'));

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <EventAdmin {...props} />
    </Providers>
  </Suspense>
);
