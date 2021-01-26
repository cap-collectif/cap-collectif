// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const PrivacyModal = lazy(() => import(/* webpackChunkName: "PrivacyModal" */ '~/components/StaticPage/PrivacyModal'));

export default (props: Object) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <PrivacyModal {...props} />
    </Providers>
  </Suspense>
);
