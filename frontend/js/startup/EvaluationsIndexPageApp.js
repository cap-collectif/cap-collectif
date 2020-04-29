// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import Providers from './Providers';
import type { GlobalState } from '~/types';
import AlertBoxApp from '~/startup/AlertBoxApp';
import EvaluationsIndexPage from '~/components/Evaluation/EvaluationsIndexPage';
import AnalysisIndexPage from '~/components/Analysis/AnalysisIndexPage/AnalysisIndexPage';
import { AnalysisProposalsProvider } from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.context';

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
  <Providers>
    <SwitchAnalysisAndLegacyEvaluationContainer {...props} />
  </Providers>
);

export default EvaluationsIndexPageApp;
