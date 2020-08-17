// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const EventListPage = lazy(() => import('~/components/Event/EventListPage'));

export default (props: Object) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <EventListPage {...props} />
    </Providers>
  </Suspense>
);
