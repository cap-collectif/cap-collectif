// @flow
import React, { lazy, Suspense } from 'react';
import { RelayEnvironmentProvider } from 'relay-hooks';
import Providers from './Providers';
import type { PropsNotConnected } from '~/components/Page/QuestionnaireStepPage';
import Loader from '~ui/FeedbacksIndicators/Loader';
import environment from '~/createRelayEnvironment';

const QuestionnaireStepPage = lazy(
  () =>
    import(
      /* webpackChunkName: "QuestionnaireStepPage" */ '~/components/Page/QuestionnaireStepPage'
    ),
);

export default (props: PropsNotConnected) => {
  document.getElementsByTagName('html')[0].style.fontSize = '14px';

  return (
    <Suspense fallback={<Loader />}>
      <Providers designSystem resetCSS={false}>
        <RelayEnvironmentProvider environment={environment}>
          <QuestionnaireStepPage {...props} />
        </RelayEnvironmentProvider>
      </Providers>
    </Suspense>
  );
};
