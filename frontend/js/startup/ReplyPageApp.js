// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/Reply/Profile/ReplyPage';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ReplyPage = lazy(() => import('~/components/Reply/Profile/ReplyPage'));

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ReplyPage {...props} />
    </Providers>
  </Suspense>
);
