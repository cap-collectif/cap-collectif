import * as React from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import { useIntl } from 'react-intl'
import { loadQuery } from 'relay-hooks'
import { connect } from 'react-redux'
import { BrowserRouter as Router, Switch, Route, useLocation } from 'react-router-dom'
import environment, { graphqlError } from '~/createRelayEnvironment'
import type { GlobalState, Dispatch } from '~/types'
import '~/types'
import { insertCustomCode } from '~/utils/customCode'
import type { QuestionnaireStepPageQuery$data } from '~relay/QuestionnaireStepPageQuery.graphql'
import '~relay/QuestionnaireStepPageQuery.graphql'
import { Loader } from '~/components/Ui/FeedbacksIndicators/Loader'
import QuestionnaireReplyPage, {
  queryReply,
} from '~/components/Questionnaire/QuestionnaireReplyPage/QuestionnaireReplyPage'
import { baseUrl } from '~/config'
import ScrollToTop from '~/components/Utils/ScrollToTop'
import type { Context } from './QuestionnaireStepPage.context'
import { QuestionnaireStepPageContext } from './QuestionnaireStepPage.context'
import CookieMonster from '~/CookieMonster'
import QuestionnairePage from '../Questionnaire/QuestionnairePage'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import StepEvents from '~/components/Steps/StepEvents'
import { dispatchNavBarEvent } from '@shared/navbar/NavBar.utils'

export type PropsNotConnected = {
  readonly initialQuestionnaireId: string | null | undefined
}
type Props = PropsNotConnected & {
  readonly dispatch: Dispatch
  readonly isAuthenticated: boolean
}

const preloadQueryReply = (isAuthenticated: boolean, replyId: string, setReplyPrefetch: any, skipPreload?: boolean) => {
  const dataReply = loadQuery()
  dataReply.next(
    environment,
    queryReply,
    {
      isAuthenticated,
      replyId,
    },
    {
      fetchPolicy: 'store-or-network',
      skip: skipPreload,
    },
  )
  if (skipPreload) return dataReply
  setReplyPrefetch(dataReply)
}

const Component = ({
  error,
  props,
  context,
  dataPrefetch,
}: ReactRelayReadyState & {
  props: QuestionnaireStepPageQuery$data | null | undefined
  context: Context
  dataPrefetch: any
}) => {
  const intl = useIntl()
  const hasFeatureFlagCalendar = useFeatureFlag('calendar')
  React.useEffect(() => {
    insertCustomCode(props?.questionnaire?.step?.customCode) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.questionnaire?.step?.id])

  React.useEffect(() => {
    dispatchNavBarEvent('set-breadcrumb', [
      { title: intl.formatMessage({ id: 'navbar.homepage' }), href: '/' },
      { title: intl.formatMessage({ id: 'global.project.label' }), href: '/projects', showOnMobile: true },
      { title: props?.questionnaire?.step?.project?.title, href: props?.questionnaire?.project?.url || '' },
      { title: props?.questionnaire?.step?.label, href: '' },
    ])
  }, [props, intl])

  if (error) return graphqlError

  if (props) {
    const { questionnaire } = props

    if (questionnaire) {
      const { step } = questionnaire
      return (
        <React.Suspense fallback={null}>
          {step && step?.eventCount?.totalCount > 0 && hasFeatureFlagCalendar && <StepEvents step={step} />}
          {step?.state === 'CLOSED' ? ( // We keep for now these "old style" alerts
            <div className="alert alert-info alert-dismissible block" role="alert">
              <p>
                <strong>
                  {intl.formatMessage({
                    id: 'step.questionnaire.alert.ended.title',
                  })}
                </strong>{' '}
                {intl.formatMessage({
                  id: 'thank.for.contribution',
                })}
              </p>
            </div>
          ) : null}
          {step?.state === 'FUTURE' ? (
            <div className="alert alert-info alert-dismissible block" role="alert">
              <p>
                <strong>
                  {intl.formatMessage({
                    id: 'step.questionnaire.alert.future.title',
                  })}
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
                  <QuestionnairePage questionnaire={questionnaire} query={props} />
                </Route>

                <Route
                  exact
                  path="/replies/:id"
                  component={routeProps => (
                    <QuestionnaireReplyPage questionnaire={questionnaire} dataPrefetch={dataPrefetch} {...routeProps} />
                  )}
                />
              </Switch>
            </Router>
          </QuestionnaireStepPageContext.Provider>
        </React.Suspense>
      )
    }

    return graphqlError
  }

  return <Loader />
}

export const QuestionnaireStepPage = ({ initialQuestionnaireId, isAuthenticated }: Props) => {
  const { state } = useLocation<{ questionnaireId: string }>()
  const questionnaireId = state?.questionnaireId || initialQuestionnaireId
  const [replyPrefetch, setReplyPrefetch] = React.useState(null)
  const anonymousRepliesIds = React.useMemo(
    () => (questionnaireId ? CookieMonster.getAnonymousRepliesIds(questionnaireId) : []),
    [questionnaireId],
  )
  const context = React.useMemo(
    () => ({
      preloadReply: (replyId: string, skipPreload?: boolean) =>
        preloadQueryReply(isAuthenticated, replyId, setReplyPrefetch, skipPreload),
      anonymousRepliesIds,
    }),
    [isAuthenticated, anonymousRepliesIds],
  )
  return questionnaireId ? (
    <QueryRenderer
      fetchPolicy="store-and-network"
      environment={environment as any}
      query={graphql`
        query QuestionnaireStepPageQuery(
          $id: ID!
          $isAuthenticated: Boolean!
          $isNotAuthenticated: Boolean!
          $anonymousRepliesIds: [ID!]!
        ) {
          questionnaire: node(id: $id) {
            ... on Questionnaire {
              title
              step {
                id
                label
                url
                state
                timeRange {
                  startAt
                }
                project {
                  title
                  url
                }
                customCode
                eventCount: events(orderBy: { field: START_AT, direction: DESC }) {
                  totalCount
                }
                ...StepEvents_step
              }
            }
            ...QuestionnaireReplyPage_questionnaire @arguments(isAuthenticated: $isAuthenticated)
            ...QuestionnairePage_questionnaire @arguments(isAuthenticated: $isAuthenticated)
          }
          ...QuestionnairePage_query
            @arguments(anonymousRepliesIds: $anonymousRepliesIds, isNotAuthenticated: $isNotAuthenticated)
        }
      `}
      variables={{
        id: questionnaireId,
        isAuthenticated,
        isNotAuthenticated: !isAuthenticated,
        anonymousRepliesIds,
      }}
      render={({ error, props, retry }) => (
        <Component error={error} props={props} retry={retry} context={context} dataPrefetch={replyPrefetch} />
      )}
    />
  ) : null
}

const mapStateToProps = (state: GlobalState) => ({
  isAuthenticated: state.user.user !== null,
})

export default connect(mapStateToProps)(QuestionnaireStepPage)
