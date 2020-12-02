// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/Debate/Page/DebateStepPage';

const DebateStepPage = lazy(() => import('~/components/Debate/Page/DebateStepPage'));

export default (props: Props) => (
  <Suspense fallback={null}>
    <Providers>
      <DebateStepPage {...props} />
    </Providers>
  </Suspense>
);
