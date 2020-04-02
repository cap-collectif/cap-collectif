// @flow
import * as React from 'react';
import { Provider, connect } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import type { GlobalState } from '~/types';
import EvaluationsIndexPage from '~/components/Evaluation/EvaluationsIndexPage';
import AnalysisIndexPage from '~/components/Analysis/AnalysisIndexPage/AnalysisIndexPage';
import { AnalysisProposalsProvider } from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.context';

const SwitchAnalysisAndLegacyEvaluation = ({ isLegacyAnalysis, ...props }: Object) =>
  isLegacyAnalysis ? (
    <EvaluationsIndexPage {...props} />
  ) : (
    <AnalysisProposalsProvider>
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
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <SwitchAnalysisAndLegacyEvaluationContainer {...props} />
    </IntlProvider>
  </Provider>
);

export default EvaluationsIndexPageApp;
