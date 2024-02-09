import * as React from 'react'
import { connect } from 'react-redux'
import { Row } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import { QueryRenderer, graphql } from 'react-relay'
import { useIntl } from 'react-intl'
import { insertCustomCode } from '~/utils/customCode'
import ProposalListFilters from '../Proposal/List/ProposalListFilters'
import UnpublishedProposalListView from '../Proposal/List/UnpublishedProposalListView'
import DraftProposalList from '../Proposal/List/DraftProposalList'
import Loader from '../Ui/FeedbacksIndicators/Loader'
import ProposalStepPageHeader from './ProposalStepPageHeader'
import StepPageHeader from '../Steps/Page/StepPageHeader/StepPageHeader'
import environment, { graphqlError } from '../../createRelayEnvironment'
import ProposalListView, { queryVariables } from '../Proposal/List/ProposalListView'
import type { Dispatch, FeatureToggles, State } from '../../types'
import type {
  ProposalStepPageQueryResponse,
  ProposalStepPageQueryVariables,
} from '~relay/ProposalStepPageQuery.graphql'
import config from '../../config'
import { formatGeoJsons } from '~/utils/geojson'
import useFeatureFlag from '~/utils/hooks/useFeatureFlag'
import StepEvents from '../Steps/StepEvents'
import ProposalVoteBasketWidget from '../Proposal/Vote/ProposalVoteBasketWidget'
import CookieMonster from '~/CookieMonster'
import MediatorAddVotesLink from './MediatorAddVotesLink'

type OwnProps = {
  stepId: string
  projectId: string
}
type StateProps = {
  filters: Record<string, any>
  order: string | null | undefined
  terms: string | null | undefined
  isAuthenticated: boolean
  features: FeatureToggles
  dispatch: Dispatch
}
type Props = OwnProps & StateProps
type RenderedProps = ProposalStepPageQueryResponse & {
  count: number
  isAuthenticated: boolean
  features: FeatureToggles
  projectId?: string
}
export const ProposalStepPageRendered = (props: RenderedProps) => {
  const { viewer, isAuthenticated, features, step, count } = props
  const [displayMode, setDisplayMode] = React.useState(step?.mainView)
  const intl = useIntl()
  const calendar = useFeatureFlag('calendar')
  const twilio = useFeatureFlag('twilio')
  const proposalSmsVote = useFeatureFlag('proposal_sms_vote')
  const smsVoteEnabled = step?.isProposalSmsVoteEnabled && twilio && proposalSmsVote && !isAuthenticated
  const showVotesWidget =
    (isAuthenticated || smsVoteEnabled) && step && step.slug && step.votable && step.state === 'OPENED'
  React.useEffect(() => {
    if (!displayMode && step?.mainView) setDisplayMode(step?.mainView)
  }, [displayMode, setDisplayMode, step])
  React.useEffect(() => {
    insertCustomCode(step?.customCode) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step?.id])

  if (!step) {
    return graphqlError
  }

  const { form } = step
  if (!form) return null
  let geoJsons = []

  if (features.display_map && form.districts) {
    geoJsons = formatGeoJsons(form.districts)
  }

  const relatedMediatorProjectId = viewer?.projectsMediator?.edges?.find(edge => edge.node.id === props.projectId)?.node
    ?.id

  return (
    <>
      {showVotesWidget && <ProposalVoteBasketWidget step={step} viewer={viewer} />}
      <div className="ProposalStepPage-rendered" id={`proposalsStep-${step.id || ''}`}>
        {step.events?.totalCount && calendar ? <StepEvents step={step} /> : null}
        {step.state === 'CLOSED' ? ( // We keep for now these "old style" alerts
          <div className="alert alert-info alert-dismissible block" role="alert">
            <p>
              <strong>
                {intl.formatMessage({
                  id: 'step.selection.alert.ended.title',
                })}
              </strong>{' '}
              {intl.formatMessage({
                id: 'thank.for.contribution',
              })}
            </p>
          </div>
        ) : null}
        {step.state === 'FUTURE' ? (
          <div className="alert alert-info alert-dismissible block" role="alert">
            <p>
              <strong>
                {intl.formatMessage({
                  id: 'step.collect.alert.future.title',
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
        <StepPageHeader step={step} />
        {isAuthenticated && step.kind === 'collect' && <DraftProposalList step={step} />}
        {isAuthenticated && <UnpublishedProposalListView step={step} viewer={viewer} />}
        {relatedMediatorProjectId && step.votable && step.state === 'OPENED' ? (
          <MediatorAddVotesLink projectId={relatedMediatorProjectId} />
        ) : null}
        <ProposalStepPageHeader step={step} displayMode={displayMode} />
        <ProposalListFilters step={step} setDisplayMode={setDisplayMode} displayMode={displayMode} />
        <ProposalListView
          displayMap={features.display_map}
          geoJsons={geoJsons}
          step={step}
          count={count}
          displayMode={displayMode}
          viewer={viewer || null}
          defaultMapOptions={{
            center: {
              lat: form.mapCenter?.lat || 48.8586047,
              lng: form.mapCenter?.lng || 2.3137325,
            },
            zoom: form.zoomMap || 10,
          }}
        />
      </div>
    </>
  )
}

const ProposalStepPage = ({ stepId, isAuthenticated, features, filters, order, projectId }: Props) => {
  const { state } = useLocation()
  const initialRenderVars = {
    term: '',
    ...queryVariables(filters, order),
  }
  const token = CookieMonster.getAnonymousAuthenticatedWithConfirmedPhone()
  return (
    <div className="proposal__step-page">
      <QueryRenderer
        fetchPolicy="store-and-network"
        environment={environment}
        query={graphql`
          query ProposalStepPageQuery(
            $stepId: ID!
            $cursor: String
            $orderBy: [ProposalOrder]
            $isAuthenticated: Boolean!
            $count: Int
            $term: String
            $district: ID
            $category: ID
            $status: ID
            $theme: ID
            $userType: ID
            $isMapDisplay: Boolean!
            $token: String
            $state: ProposalsState
          ) {
            viewer @include(if: $isAuthenticated) {
              ...ProposalListView_viewer @arguments(stepId: $stepId)
              ...UnpublishedProposalListView_viewer @arguments(stepId: $stepId)
              ...ProposalVoteBasketWidget_viewer @arguments(stepId: $stepId)
              projectsMediator {
                edges {
                  node {
                    id
                  }
                }
              }
            }
            step: node(id: $stepId) {
              ... on ProposalStep {
                isProposalSmsVoteEnabled
                customCode
                id
                events(orderBy: { field: START_AT, direction: DESC }) {
                  totalCount
                }
                ...ProposalVoteBasketWidget_step @arguments(token: $token)
                defaultSort
                voteType
                state
                slug
                votable
                statuses {
                  id
                  name
                }
                timeRange {
                  startAt
                }
                form {
                  mapCenter {
                    lat
                    lng
                  }
                  zoomMap
                  districts(order: ALPHABETICAL) @include(if: $isMapDisplay) {
                    displayedOnMap
                    geojson
                    id
                    border {
                      id
                      enabled
                      color
                      opacity
                      size
                    }
                    background {
                      id
                      enabled
                      color
                      opacity
                      size
                    }
                  }
                }
                kind
                ...ProposalsDisplayMap_step
                ...StepPageHeader_step
                ...ProposalListFilters_step
                ...ProposalListView_step
                ...UnpublishedProposalListView_step @arguments(isAuthenticated: $isAuthenticated)
                ...ProposalStepPageHeader_step
                ...StepEvents_step
                ... on CollectStep {
                  private
                  mainView
                  ...DraftProposalList_step @arguments(isAuthenticated: $isAuthenticated)
                }
                ... on SelectionStep {
                  mainView
                }
              }
            }
          }
        `}
        variables={
          {
            stepId: state?.stepId || stepId,
            isAuthenticated,
            count: config.isMobile ? 10 : 50,
            cursor: null,
            ...initialRenderVars,
            isMapDisplay: features.display_map || false,
            token,
          } as ProposalStepPageQueryVariables
        }
        render={({
          error,
          props,
        }: ReactRelayReadyState & {
          props: ProposalStepPageQueryResponse | null | undefined
        }) => {
          if (error) {
            return graphqlError
          }

          if (props) {
            return (
              <ProposalStepPageRendered
                {...props}
                count={50}
                isAuthenticated={isAuthenticated}
                features={features}
                projectId={projectId}
              />
            )
          }

          return (
            <Row>
              <Loader />
            </Row>
          )
        }}
      />
    </div>
  )
}

const mapStateToProps = (state: State) => {

  const urlSearch = new URLSearchParams(window.location.search)
  const filters = Object.entries(state.proposal.filters).reduce((acc, [key, value]) => {
    if (urlSearch.get(key)) {
      acc[key] = urlSearch.get(key)
    } else {
      acc[key] = value
    }
    return acc;
  }, {});

  return {
    isAuthenticated: state.user.user !== null,
    filters: filters || {},
    terms: state.proposal.terms,
    order: state.proposal.order,
    features: state.default.features,
  }
}

// @ts-ignore
export default connect<Props, OwnProps>(mapStateToProps)(ProposalStepPage)
