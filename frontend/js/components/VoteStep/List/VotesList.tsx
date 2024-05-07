import * as React from 'react'
import { useLazyLoadQuery, graphql, usePaginationFragment } from 'react-relay'
import { AnimatePresence, m as motion } from 'framer-motion'
import type { VotesListQuery as VotesListQueryType } from '~relay/VotesListQuery.graphql'
import type { VotesList_step$key } from '~relay/VotesList_step.graphql'
import ProposalPreviewCard from './ProposalPreviewCard'
import useIsMobile from '~/utils/hooks/useIsMobile'
import { useEventListener } from '~/utils/hooks/useEventListener'
import { List } from './ProposalsList'
import { DELAY_BEFORE_PROPOSAL_REMOVAL, VoteStepEvent } from '../utils'
import EmptyList from './EmptyList'
import { useSelector } from 'react-redux'
import { State } from '~/types'
import CookieMonster from '~/CookieMonster'

const QUERY = graphql`
  query VotesListQuery($stepId: ID!, $count: Int!, $cursor: String, $isAuthenticated: Boolean!, $token: String) {
    voteStep: node(id: $stepId) {
      ... on ProposalStep {
        ...ProposalPreviewCard_step @arguments(isAuthenticated: $isAuthenticated, token: $token)
        open
        ...VotesList_step
          @arguments(count: $count, cursor: $cursor, stepId: $stepId, isAuthenticated: $isAuthenticated, token: $token)
      }
    }
    viewer @include(if: $isAuthenticated) {
      ...ProposalPreviewCard_viewer @arguments(stepId: $stepId)
    }
  }
`

const FRAGMENT = graphql`
  fragment VotesList_step on ProposalStep
  @argumentDefinitions(
    count: { type: "Int!" }
    cursor: { type: "String" }
    stepId: { type: "ID!" }
    isAuthenticated: { type: "Boolean!" }
    token: { type: "String" }
  )
  @refetchable(queryName: "VotesListPaginationQuery") {
    userVotes: viewerVotes(first: $count, after: $cursor, orderBy: { field: POSITION, direction: ASC }, token: $token)
      @connection(key: "VotesList_userVotes", filters: []) {
      edges {
        node {
          id
          proposal {
            id
            ...ProposalPreviewCard_proposal @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated)
          }
        }
      }
    }
  }
`

type Props = {
  stepId: string
  showImages?: boolean
}

export const VotesList = ({ stepId, showImages = false }: Props) => {
  const isMobile = useIsMobile()
  const isAuthenticated = useSelector((state: State) => state.user.user !== null)
  const [animateCard, setAnimateCard] = React.useState(false)
  const LOAD_PROPOSAL_COUNT = isMobile ? 25 : 50

  const query = useLazyLoadQuery<VotesListQueryType>(
    QUERY,
    {
      stepId,
      count: LOAD_PROPOSAL_COUNT,
      cursor: null,
      isAuthenticated,
      token: CookieMonster.getAnonymousAuthenticatedWithConfirmedPhone(),
    },
    {
      fetchPolicy: 'network-only',
    },
  )

  const { data, loadNext, hasNext } = usePaginationFragment<VotesListQueryType, VotesList_step$key>(
    FRAGMENT,
    query.voteStep,
  )

  useEventListener(VoteStepEvent.AnimateCard, () => setAnimateCard(true))
  useEventListener(VoteStepEvent.RemoveVote, () => {
    setTimeout(() => setAnimateCard(false), DELAY_BEFORE_PROPOSAL_REMOVAL * 1000 * 2)
  })

  if (!data || !data.userVotes) return null
  const viewerVotes = data.userVotes.edges?.map(edge => edge?.node?.proposal).filter(Boolean)
  if (!viewerVotes.length)
    return (
      <List id="empty-list">
        <EmptyList isVotesView />
      </List>
    )

  return (
    <List hasNext={hasNext} loadNext={loadNext} id="votes-list" loadCount={LOAD_PROPOSAL_COUNT}>
      <AnimatePresence initial={false}>
        {viewerVotes.map(proposal => (
          <motion.div
            key={`${proposal.id}-voteList`}
            initial={{
              opacity: 1,
              height: 'auto',
              marginBottom: '1.7rem',
            }}
            animate={{
              opacity: 1,
              height: 'auto',
              marginBottom: '1.7rem',
            }}
            exit={{
              opacity: 0,
              height: 0,
              marginBottom: '0rem',
            }}
            transition={{
              delay: animateCard ? DELAY_BEFORE_PROPOSAL_REMOVAL : 0,
              duration: animateCard ? DELAY_BEFORE_PROPOSAL_REMOVAL : 0,
            }}
            layout
          >
            <ProposalPreviewCard
              proposal={proposal}
              viewer={query.viewer}
              step={query.voteStep}
              showImage={showImages}
              stepId={stepId}
              disabled={!query?.voteStep?.open}
              fullSize
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </List>
  )
}
export default VotesList
