// @flow
import * as React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { loadQuery } from 'relay-hooks';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import environment, { graphqlError } from '~/createRelayEnvironment';
import { type GlobalState } from '~/types';
import { type QuestionnaireStepPageQueryResponse } from '~relay/QuestionnaireStepPageQuery.graphql';
import { Loader } from '~/components/Ui/FeedbacksIndicators/Loader';
import QuestionnaireStepTabs from '../Questionnaire/QuestionnaireStepTabs';
import QuestionnaireReplyPage, {
  queryReply,
} from '~/components/Questionnaire/QuestionnaireReplyPage/QuestionnaireReplyPage';
import { baseUrl } from '~/config';
import ScrollToTop from '~/components/Utils/ScrollToTop';
import { QuestionnaireStepPageContext, type Context } from './QuestionnaireStepPage.context';

export type PropsNotConnected = {|
  +questionnaireId: ?string,
  +isPrivateResult: boolean,
|};

type Props = {|
  ...PropsNotConnected,
  +isAuthenticated: boolean,
  +enableResults: boolean,
|};

const preloadQueryReply = (
  isAuthenticated: boolean,
  replyId: string,
  setReplyPrefetch: any,
  skipPreload?: boolean,
) => {
  const dataReply = loadQuery();

  dataReply.next(
    environment,
    queryReply,
    {
      isAuthenticated,
      replyId,
    },
    { fetchPolicy: 'store-or-network', skip: skipPreload },
  );

  if (skipPreload) return dataReply;

  setReplyPrefetch(dataReply);
};

const component = ({
  error,
  props,
  context,
  dataPrefetch,
}: {
  ...ReactRelayReadyState,
  props: ?QuestionnaireStepPageQueryResponse,
  context: Context,
  dataPrefetch: any,
}) => {
  if (error) return graphqlError;

  if (props) {
    const { questionnaire } = props;
    if (questionnaire) {
      return (
        <QuestionnaireStepPageContext.Provider value={context}>
          <Router basename={questionnaire?.step?.url?.replace(baseUrl, '')}>
            <ScrollToTop />

            <Switch>
              <Route exact path="/">
                <QuestionnaireStepTabs questionnaire={questionnaire} />
              </Route>

              <Route
                exact
                path="/replies/:id"
                component={routeProps => (
                  <QuestionnaireReplyPage
                    questionnaire={questionnaire}
                    dataPrefetch={dataPrefetch}
                    {...routeProps}
                  />
                )}
              />
            </Switch>
          </Router>
        </QuestionnaireStepPageContext.Provider>
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
}: Props) => {
  const [replyPrefetch, setReplyPrefetch] = React.useState(null);

  const context = React.useMemo(
    () => ({
      preloadReply: (replyId: string, skipPreload?: boolean) =>
        preloadQueryReply(isAuthenticated, replyId, setReplyPrefetch, skipPreload),
    }),
    [isAuthenticated],
  );

  return questionnaireId ? (
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
            }
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
      render={({ error, props, retry }) =>
        component({ error, props, retry, context, dataPrefetch: replyPrefetch })
      }
    />
  ) : null;
};

const mapStateToProps = (state: GlobalState) => ({
  isAuthenticated: state.user.user !== null,
  enableResults: state.default.features.new_feature_questionnaire_result || false,
});

export default connect<Props, GlobalState, _>(mapStateToProps)(QuestionnaireStepPage);
