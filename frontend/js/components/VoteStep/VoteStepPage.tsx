import { Flex } from '@cap-collectif/ui'
import * as React from 'react'
import { useLocation } from 'react-router-dom'
import useIsMobile from '~/utils/hooks/useIsMobile'
import VoteStepPageWebLayout from './VoteStepPageWebLayout'
import VoteStepPageMobileLayout from './VoteStepPageMobileLayout'
import { VoteStepContextProvider } from '~/components/VoteStep/Context/VoteStepContext'
import { useWindowWidth } from '~/utils/hooks/useWindowWidth'
import TabletScreenTooSmall from './TabletScreenTooSmall'
import { VoteStepPageQuery } from '~relay/VoteStepPageQuery.graphql'
import { graphql, useLazyLoadQuery } from 'react-relay'
import ProposalStepPage from '~/components/Page/ProposalStepPage'
import { ProjectTrash } from '~/startup/ProjectStepPageAppTrash'
import VoteStepPageDescription from './VoteStepPageDescription'
import CookieMonster from '~/CookieMonster'

type Props = {
  stepId: string
  projectId: string
  isMapView: boolean
  showTrash: boolean
  projectSlug: string
}

const QUERY = graphql`
  query VoteStepPageQuery($stepId: ID!, $token: String) {
    ...VoteStepPageWebLayout_query @arguments(stepId: $stepId)
    ...VoteStepPageMobileLayout_query @arguments(stepId: $stepId)
    step: node(id: $stepId) {
      ... on ProposalStep {
        __typename
        voteType
        voteThreshold
        budget
        form {
          objectType
          contribuable
          isMapViewEnabled
        }
        body
        viewerVotes(token: $token) {
          totalCount
          edges {
            node {
              ... on ProposalUserVote {
                anonymous
              }
            }
          }
        }
        project {
          firstCollectStep {
            form {
              isMapViewEnabled
            }
          }
        }
        kind
        title
        timeRange {
          startAt
          endAt
        }
      }
    }
  }
`

export const VoteStepPage = ({ stepId, isMapView, showTrash, projectSlug }: Props) => {
  const isMobile = useIsMobile()
  const { width } = useWindowWidth()
  const { state } = useLocation<{ stepId?: string }>()
  const isTabletScreenTooSmall = width > 767 && width < 1133
  const step: string = state?.stepId || stepId
  const data = useLazyLoadQuery<VoteStepPageQuery>(QUERY, {
    stepId: step,
    token: CookieMonster.getAnonymousAuthenticatedWithConfirmedPhone(),
  })

  const hasMapView =
    data.step.__typename === 'CollectStep'
      ? data.step.form?.isMapViewEnabled
      : data.step?.project?.firstCollectStep?.form?.isMapViewEnabled

  const forceOldView = data.step.form.objectType !== 'PROPOSAL' || !!data.step.voteThreshold || data.step.budget

  const isParticipationAnonymous =
    !data.step.viewerVotes.totalCount ||
    data.step.viewerVotes?.edges.filter(e => !!e?.node).every(({ node }) => !!node.anonymous)

  React.useEffect(() => {
    const html = document.querySelector('html')
    if (html && !forceOldView) html.classList.remove('has-vote-widget')
    else if (html) html.classList.add('has-vote-widget')
  }, [step, forceOldView])

  // For now, we don't handle vote threshold and other step types
  if (forceOldView) {
    return (
      <>
        <section className="section--alt">
          <div className="container">
            {/** @ts-ignore TODO: typescript on redux connect */}
            <ProposalStepPage stepId={step} projectId={step} />
          </div>
        </section>
        <ProjectTrash projectSlug={projectSlug} showTrash={showTrash} />
      </>
    )
  }

  return (
    <>
      {isTabletScreenTooSmall ? <TabletScreenTooSmall /> : null}
      <VoteStepContextProvider
        hasMapView={hasMapView}
        isMapView={hasMapView && isMapView}
        isParticipationAnonymous={isParticipationAnonymous}
      >
        <Flex
          direction="column"
          position="relative"
          mt={6}
          alignItems="center"
          bg="neutral-gray.100"
          id={`vote-step-page-${step}`}
        >
          {isMobile ? (
            <VoteStepPageMobileLayout stepId={step} isMapView={isMapView} query={data} />
          ) : (
            <>
              <VoteStepPageDescription
                title={data.step.title}
                body={data.step.body as string}
                timeRange={data.step.timeRange}
              />
              <VoteStepPageWebLayout stepId={step} isMapView={isMapView} query={data} />
            </>
          )}
        </Flex>
      </VoteStepContextProvider>
    </>
  )
}
export default VoteStepPage
