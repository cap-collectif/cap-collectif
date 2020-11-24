// @flow
import React, { lazy, Suspense } from 'react';
import { RelayEnvironmentProvider } from 'relay-hooks';
import Providers from './Providers';
import type { PropsNotConnected } from '~/components/Page/QuestionnaireStepPage';
import Loader from '~ui/FeedbacksIndicators/Loader';
import environment from '~/createRelayEnvironment';

const QuestionnaireStepPage = lazy(() => import('~/components/Page/QuestionnaireStepPage'));

export default (props: PropsNotConnected) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <RelayEnvironmentProvider environment={environment}>
        <QuestionnaireStepPage {...props} />
      </RelayEnvironmentProvider>
    </Providers>
  </Suspense>
);
