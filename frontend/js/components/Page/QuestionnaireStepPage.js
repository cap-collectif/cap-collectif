// @flow
import * as React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { useIntl } from 'react-intl';
import { loadQuery } from 'relay-hooks';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Switch, Route, useLocation } from 'react-router-dom';
import environment, { graphqlError } from '~/createRelayEnvironment';
import { type GlobalState, type Dispatch } from '~/types';
import { insertCustomCode } from '~/utils/customCode';
import { type QuestionnaireStepPageQueryResponse } from '~relay/QuestionnaireStepPageQuery.graphql';
import { Loader } from '~/components/Ui/FeedbacksIndicators/Loader';
import QuestionnaireStepTabs from '../Questionnaire/QuestionnaireStepTabs';
import QuestionnaireReplyPage, {
  queryReply,
} from '~/components/Questionnaire/QuestionnaireReplyPage/QuestionnaireReplyPage';
import { baseUrl } from '~/config';
import ScrollToTop from '~/components/Utils/ScrollToTop';
import { QuestionnaireStepPageContext, type Context } from './QuestionnaireStepPage.context';
import CookieMonster from '~/CookieMonster';

export type PropsNotConnected = {|
  +initialQuestionnaireId: ?string,
|};

type Props = {|
  ...PropsNotConnected,
  +dispatch: Dispatch,
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

const Component = ({
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
  const intl = useIntl();

  React.useEffect(() => {
    insertCustomCode(props?.questionnaire?.step?.customCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.questionnaire?.step?.id]);

  if (error) return graphqlError;

  if (props) {
    const { questionnaire } = props;
    if (questionnaire) {
      const { step } = questionnaire;
      return (
        <>
          {step?.state === 'CLOSED' ? ( // We keep for now these "old style" alerts
            <div className="alert alert-info alert-dismissible block" role="alert">
              <p>
                <strong>
                  {intl.formatMessage({ id: 'step.questionnaire.alert.ended.title' })}
                </strong>{' '}
                {intl.formatMessage({ id: 'thank.for.contribution' })}
              </p>
            </div>
          ) : null}
          {step?.state === 'FUTURE' ? (
            <div className="alert alert-info alert-dismissible block" role="alert">
              <p>
                <strong>
                  {intl.formatMessage({ id: 'step.questionnaire.alert.future.title' })}
                </strong>{' '}
                {intl.formatMessage(
                  {
                    id: 'step.start.future',
                  },
                  {
                    date: intl.formatDate(step.timeRange?.startAt),
                  },
                )}
              </p>
            </div>
          ) : null}
          <QuestionnaireStepPageContext.Provider value={context}>
            <Router basename={step?.url?.replace(baseUrl, '')}>
              <ScrollToTop />

              <Switch>
                <Route exact path="/">
                  <QuestionnaireStepTabs questionnaire={questionnaire} query={props} />
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
          </QuestionnaireStepPageContext.Provider>{' '}
        </>
      );
    }

    return graphqlError;
  }

  return <Loader />;
};

export const QuestionnaireStepPage = ({
  initialQuestionnaireId,
  isAuthenticated,
  enableResults,
}: Props) => {
  const { state } = useLocation();

  const questionnaireId = state?.questionnaireId || initialQuestionnaireId;

  const [replyPrefetch, setReplyPrefetch] = React.useState(null);
  const anonymousRepliesIds = React.useMemo(
    () => (questionnaireId ? CookieMonster.getAnonymousRepliesIds(questionnaireId) : []),
    [questionnaireId],
  );

  const context = React.useMemo(
    () => ({
      preloadReply: (replyId: string, skipPreload?: boolean) =>
        preloadQueryReply(isAuthenticated, replyId, setReplyPrefetch, skipPreload),
      anonymousRepliesIds,
    }),
    [isAuthenticated, anonymousRepliesIds],
  );
  return questionnaireId ? (
    <QueryRenderer
      fetchPolicy="store-and-network"
      environment={environment}
      query={graphql`
        query QuestionnaireStepPageQuery(
          $id: ID!
          $isAuthenticated: Boolean!
          $isNotAuthenticated: Boolean!
          $enableResults: Boolean!
          $anonymousRepliesIds: [ID!]!
        ) {
          questionnaire: node(id: $id) {
            ... on Questionnaire {
              step {
                id
                url
                state
                timeRange {
                  startAt
                }
                customCode
              }
            }
            ...QuestionnaireReplyPage_questionnaire @arguments(isAuthenticated: $isAuthenticated)
            ...QuestionnaireStepTabs_questionnaire
              @arguments(isAuthenticated: $isAuthenticated, enableResults: $enableResults)
          }
          ...QuestionnaireStepTabs_query
            @arguments(
              anonymousRepliesIds: $anonymousRepliesIds
              isNotAuthenticated: $isNotAuthenticated
            )
        }
      `}
      variables={{
        id: questionnaireId,
        isAuthenticated,
        isNotAuthenticated: !isAuthenticated,
        enableResults,
        anonymousRepliesIds,
      }}
      render={({ error, props, retry }) => (
        <Component
          error={error}
          props={props}
          retry={retry}
          context={context}
          dataPrefetch={replyPrefetch}
        />
      )}
    />
  ) : null;
};

const mapStateToProps = (state: GlobalState) => ({
  isAuthenticated: state.user.user !== null,
  enableResults: state.default.features.beta__questionnaire_result || false,
});

export default connect<Props, PropsNotConnected, _, _, _, _>(mapStateToProps)(
  QuestionnaireStepPage,
);
