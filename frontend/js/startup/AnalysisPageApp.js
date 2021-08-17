// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import AlertBoxApp from '~/startup/AlertBoxApp';
import { AnalysisProposalsProvider } from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.context';
import Loader from '~ui/FeedbacksIndicators/Loader';

const AnalysisIndexPage = lazy(() =>
  import(
    /* webpackChunkName: "AnalysisIndexPage" */ '~/components/Analysis/AnalysisIndexPage/AnalysisIndexPage'
  ),
);

const AnalysisPageApp = () => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <AnalysisProposalsProvider>
        <AlertBoxApp />
        <AnalysisIndexPage />
      </AnalysisProposalsProvider>
    </Providers>
  </Suspense>
);

export default AnalysisPageApp;
