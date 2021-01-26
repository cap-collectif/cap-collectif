// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const EditProfileBox = lazy(() => import(/* webpackChunkName: "EditProfileBox" */ '~/components/User/Profile/EditProfileBox'));

export default (props: Object) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <EditProfileBox {...props} />
    </Providers>
  </Suspense>
);
