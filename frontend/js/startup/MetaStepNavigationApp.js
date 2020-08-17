// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/Steps/MetaStepNavigationBox';
import Loader from '~ui/FeedbacksIndicators/Loader';

const MetaStepNavigationBox = lazy(() => import('~/components/Steps/MetaStepNavigationBox'));

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <MetaStepNavigationBox {...props} />
    </Providers>
  </Suspense>
);
