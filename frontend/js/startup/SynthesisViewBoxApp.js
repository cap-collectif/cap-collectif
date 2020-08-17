// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/Synthesis/SynthesisBox';
import Loader from '~ui/FeedbacksIndicators/Loader';

const SynthesisBox = lazy(() => import('~/components/Synthesis/SynthesisBox'));

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <SynthesisBox {...props} />
    </Providers>
  </Suspense>
);
