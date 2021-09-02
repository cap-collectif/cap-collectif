// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props as PropsEventListProfile } from '~/components/Event/Profile/EventListProfile';
import Loader from '~ui/FeedbacksIndicators/Loader';

const EventListProfile = lazy(() =>
  import(/* webpackChunkName: "EventListProfile" */ '~/components/Event/Profile/EventListProfile'),
);

type Props = {
  userId?: $PropertyType<PropsEventListProfile, 'userId'>,
};

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <EventListProfile {...props} />
    </Providers>
  </Suspense>
);
