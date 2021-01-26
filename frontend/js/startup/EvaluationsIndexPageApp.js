// @flow
import React, { lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import Providers from './Providers';
import type { GlobalState } from '~/types';
import AlertBoxApp from '~/startup/AlertBoxApp';
import { AnalysisProposalsProvider } from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.context';
import Loader from '~ui/FeedbacksIndicators/Loader';

const EvaluationsIndexPage = lazy(() => import(/* webpackChunkName: "EvaluationsIndexPage" */ '~/components/Evaluation/EvaluationsIndexPage'));
const AnalysisIndexPage = lazy(() =>
  import(/* webpackChunkName: "AnalysisIndexPage" */ '~/components/Analysis/AnalysisIndexPage/AnalysisIndexPage'),
);

const SwitchAnalysisAndLegacyEvaluation = ({ isLegacyAnalysis, ...props }: Object) =>
  isLegacyAnalysis ? (
    <EvaluationsIndexPage {...props} />
  ) : (
    <AnalysisProposalsProvider>
      <AlertBoxApp />
      <AnalysisIndexPage />
    </AnalysisProposalsProvider>
  );

const mapStateToProps = (state: GlobalState) => ({
  isLegacyAnalysis: !state.default.features.unstable__analysis,
});

const SwitchAnalysisAndLegacyEvaluationContainer = connect(mapStateToProps)(
  SwitchAnalysisAndLegacyEvaluation,
);

const EvaluationsIndexPageApp = (props: Object) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <SwitchAnalysisAndLegacyEvaluationContainer {...props} />
    </Providers>
  </Suspense>
);

export default EvaluationsIndexPageApp;
