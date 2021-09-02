// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const FollowingsBox = lazy(() =>
  import(/* webpackChunkName: "FollowingsBox" */ '~/components/User/Following/FollowingsBox'),
);

export default (props: Object) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <FollowingsBox {...props} />
    </Providers>
  </Suspense>
);
