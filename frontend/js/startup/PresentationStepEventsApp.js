// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/PresentationStep/PresentationStepEvents';
import Loader from '~ui/FeedbacksIndicators/Loader';

const PresentationStepEvents = lazy(() =>
  import(
    /* webpackChunkName: "PresentationStepEvents" */ '~/components/PresentationStep/PresentationStepEvents'
  ),
);

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <PresentationStepEvents {...props} />
    </Providers>
  </Suspense>
);
