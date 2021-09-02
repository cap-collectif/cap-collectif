// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/HomePage/HomePageEvents';
import Loader from '~ui/FeedbacksIndicators/Loader';

const HomePageEvents = lazy(() =>
  import(/* webpackChunkName: "HomePageEvents" */ '~/components/HomePage/HomePageEvents'),
);

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <HomePageEvents {...props} />
    </Providers>
  </Suspense>
);
