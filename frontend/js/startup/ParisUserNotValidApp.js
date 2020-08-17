// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ParisUserNotValidModal = lazy(() =>
  import('~/components/User/Profile/ParisUserNotValidModal'),
);

export default (props: Object) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ParisUserNotValidModal {...props} />
    </Providers>
  </Suspense>
);
