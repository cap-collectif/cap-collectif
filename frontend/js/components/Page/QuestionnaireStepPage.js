// @flow
import * as React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import environment, { graphqlError } from '~/createRelayEnvironment';
import { type GlobalState } from '~/types';
import { type QuestionnaireStepPageQueryResponse } from '~relay/QuestionnaireStepPageQuery.graphql';
import { Loader } from '~/components/Ui/FeedbacksIndicators/Loader';
import QuestionnaireStepTabs from '../Questionnaire/QuestionnaireStepTabs';
import QuestionnaireReplyPage from '~/components/Questionnaire/QuestionnaireReplyPage/QuestionnaireReplyPage';
import { baseUrl } from '~/config';
import ScrollToTop from '~/components/Utils/ScrollToTop';

export type Props = {|
  +questionnaireId: ?string,
  +isAuthenticated: boolean,
  +isPrivateResult: boolean,
  +enableResults: boolean,
|};

const component = ({
  error,
  props,
}: {
  ...ReactRelayReadyState,
  props: ?QuestionnaireStepPageQueryResponse,
}) => {
  if (error) {
    return graphqlError;
  }

  if (props) {
    const { questionnaire } = props;
    if (questionnaire) {
      return (
        <Router
          basename={
            questionnaire.step &&
            questionnaire.step.url &&
            questionnaire.step.url.replace(baseUrl, '')
          }>
          <ScrollToTop />

          <Switch>
            <Route
              exact
              path="/"
              component={() => <QuestionnaireStepTabs questionnaire={questionnaire} />}
            />
            <Route
              exact
              path="/replies/:id"
              component={routeProps => (
                <QuestionnaireReplyPage
                  questionnaire={questionnaire}
                  reply={
                    questionnaire.viewerReplies &&
                    questionnaire.viewerReplies.find(({ id }) => id === routeProps.match.params.id)
                  }
                  {...routeProps}
                />
              )}
            />
          </Switch>
        </Router>
      );
    }

    return graphqlError;
  }
  return <Loader />;
};

export const QuestionnaireStepPage = ({
  questionnaireId,
  isAuthenticated,
  enableResults,
  isPrivateResult,
}: Props) =>
  questionnaireId ? (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query QuestionnaireStepPageQuery(
          $id: ID!
          $isAuthenticated: Boolean!
          $enableResults: Boolean!
        ) {
          questionnaire: node(id: $id) {
            ... on Questionnaire {
              step {
                url
              }
              viewerReplies @include(if: $isAuthenticated) {
                id
                ...QuestionnaireReplyPage_reply @arguments(isAuthenticated: $isAuthenticated)
              }
            }
            ...QuestionnairePage_questionnaire @arguments(isAuthenticated: $isAuthenticated)
            ...QuestionnaireReplyPage_questionnaire @arguments(isAuthenticated: $isAuthenticated)
            ...QuestionnaireStepTabs_questionnaire
              @arguments(isAuthenticated: $isAuthenticated, enableResults: $enableResults)
          }
        }
      `}
      variables={{
        id: questionnaireId,
        isAuthenticated,
        enableResults: enableResults && !isPrivateResult,
      }}
      render={component}
    />
  ) : null;

const mapStateToProps = (state: GlobalState) => ({
  isAuthenticated: state.user.user !== null,
  enableResults: state.default.features.new_feature_questionnaire_result || false,
});

export default connect<Props, GlobalState, _>(mapStateToProps)(QuestionnaireStepPage);
