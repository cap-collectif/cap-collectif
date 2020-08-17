// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { PropsNotConnected } from '~/components/Page/QuestionnaireStepPage';
import Loader from '~ui/FeedbacksIndicators/Loader';

const QuestionnaireStepPage = lazy(() => import('~/components/Page/QuestionnaireStepPage'));

export default (props: PropsNotConnected) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <QuestionnaireStepPage {...props} />
    </Providers>
  </Suspense>
);
