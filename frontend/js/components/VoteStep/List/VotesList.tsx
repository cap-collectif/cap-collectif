import * as React from 'react'
import { useLazyLoadQuery, graphql, usePaginationFragment } from 'react-relay'
import { AnimatePresence, m as motion } from 'framer-motion'
import type { VotesListQuery as VotesListQueryType } from '~relay/VotesListQuery.graphql'
import ProposalPreviewCard from './ProposalPreviewCard'
import useIsMobile from '~/utils/hooks/useIsMobile'
import { useEventListener } from '~/utils/hooks/useEventListener'
import { List } from './ProposalsList'
import { DELAY_BEFORE_PROPOSAL_REMOVAL, VoteStepEvent } from '../utils'
import EmptyList from './EmptyList'
const QUERY = graphql`
  query VotesListQuery($stepId: ID!, $count: Int!, $cursor: String) {
    voteStep: node(id: $stepId) {
      ... on SelectionStep {
        open
        ...VotesList_step @arguments(count: $count, cursor: $cursor, stepId: $stepId)
      }
    }
  }
`
const FRAGMENT = graphql`
  fragment VotesList_step on SelectionStep
  @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" }, stepId: { type: "ID!" })
  @refetchable(queryName: "VotesListPaginationQuery") {
    viewerVotes(first: $count, after: $cursor, orderBy: { field: PUBLISHED_AT, direction: DESC })
      @connection(key: "VotesList_viewerVotes", filters: []) {
      edges {
        node {
          id
          proposal {
            id
            ...ProposalPreviewCard_proposal @arguments(stepId: $stepId)
          }
        }
      }
    }
  }
`
type Props = {
  readonly stepId: string
  readonly showImages?: boolean
}
export const VotesList = ({ stepId, showImages = false }: Props) => {
  const isMobile = useIsMobile()
  const [animateCard, setAnimateCard] = React.useState(false)
  const LOAD_PROPOSAL_COUNT = isMobile ? 25 : 50
  const query = useLazyLoadQuery<VotesListQueryType>(
    QUERY,
    {
      stepId,
      count: LOAD_PROPOSAL_COUNT,
      cursor: null,
    },
    {
      fetchPolicy: 'network-only',
    },
  )
  const { data, loadNext, hasNext } = usePaginationFragment(FRAGMENT, query.voteStep)
  useEventListener(VoteStepEvent.AnimateCard, () => setAnimateCard(true))
  useEventListener(VoteStepEvent.RemoveVote, () => {
    setTimeout(() => setAnimateCard(false), DELAY_BEFORE_PROPOSAL_REMOVAL * 1000 * 2)
  })
  if (!data || !data.viewerVotes) return null
  const viewerVotes = data.viewerVotes.edges?.map(edge => edge?.node?.proposal).filter(Boolean)
  if (!viewerVotes.length) return <EmptyList isVotesView />
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
          >
            <ProposalPreviewCard
              proposal={proposal}
              showImage={showImages}
              hasVoted
              stepId={stepId}
              disabled={!query?.voteStep?.open}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </List>
  )
}
export default VotesList
