// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const EventPage = lazy(() => import(/* webpackChunkName: "EventPage" */ '~/components/Event/EventPage/EventPage'));

type Props = {
  userId?: string,
  isAuthenticated?: boolean,
};

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <EventPage {...props} />
    </Providers>
  </Suspense>
);
