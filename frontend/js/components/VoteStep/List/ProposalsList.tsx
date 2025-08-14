import * as React from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import { Box, Flex, Spinner, CapUIIconSize } from '@cap-collectif/ui'
import { AnimatePresence, m as motion } from 'framer-motion'
import { useLazyLoadQuery, graphql, usePaginationFragment, fetchQuery, commitLocalUpdate } from 'react-relay'
import { ConnectionHandler } from 'relay-runtime'
import type { ProposalsListQuery as ProposalsListQueryType } from '~relay/ProposalsListQuery.graphql'
import type { ProposalsList_step$key } from '~relay/ProposalsList_step.graphql'
import ProposalPreviewCard from './ProposalPreviewCard'
import { useEventListener } from '@shared/hooks/useEventListener'
import useIsMobile from '~/utils/hooks/useIsMobile'
import environment from '~/createRelayEnvironment'
import { useVoteStepContext } from '~/components/VoteStep/Context/VoteStepContext'
import { DELAY_BEFORE_PROPOSAL_REMOVAL, VoteStepEvent, getOrderByArgs, View, parseLatLngBounds } from '../utils'
import EmptyList from './EmptyList'
import { useSelector } from 'react-redux'
import { State } from '~/types'
import CookieMonster from '@shared/utils/CookieMonster'
import useVoteStepFilters from '~/components/VoteStep/Filters/useVoteStepFilters'

const QUERY = graphql`
  query ProposalsListQuery(
    $stepId: ID!
    $count: Int!
    $orderBy: [ProposalOrder]
    $cursor: String
    $userType: ID
    $theme: ID
    $category: ID
    $district: ID
    $status: ID
    $geoBoundingBox: GeoBoundingBox
    $term: String
    $isAuthenticated: Boolean!
    $token: String
  ) {
    voteStep: node(id: $stepId) {
      ... on ProposalStep {
        open
        ...ProposalPreviewCard_step @arguments(isAuthenticated: $isAuthenticated, token: $token)
        ...ProposalsList_step
          @arguments(
            count: $count
            cursor: $cursor
            orderBy: $orderBy
            userType: $userType
            theme: $theme
            category: $category
            district: $district
            status: $status
            geoBoundingBox: $geoBoundingBox
            term: $term
            stepId: $stepId
            isAuthenticated: $isAuthenticated,
            token: $token
          )
      }
    }
    viewer @include(if: $isAuthenticated) {
      ...ProposalPreviewCard_viewer @arguments(stepId: $stepId)
    }
  }
`

const FRAGMENT = graphql`
  fragment ProposalsList_step on ProposalStep
  @argumentDefinitions(
    count: { type: "Int!" }
    cursor: { type: "String" }
    orderBy: { type: "[ProposalOrder]" }
    userType: { type: "ID" }
    theme: { type: "ID" }
    category: { type: "ID" }
    district: { type: "ID" }
    status: { type: "ID" }
    geoBoundingBox: { type: "GeoBoundingBox" }
    term: { type: "String" }
    stepId: { type: "ID!" }
    isAuthenticated: { type: "Boolean!" }
    token: { type: "String" }
  )
  @refetchable(queryName: "ProposalsListPaginationQuery") {
    proposals(
      first: $count
      after: $cursor
      orderBy: $orderBy
      userType: $userType
      theme: $theme
      category: $category
      district: $district
      status: $status
      geoBoundingBox: $geoBoundingBox
      term: $term
    ) @connection(key: "ProposalsList_proposals", filters: []) {
      __id
      edges {
        node {
          id
          ...ProposalPreviewCard_proposal @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated, token: $token)
        }
      }
    }
    proposalsCount: proposals {
      totalCount
    }
  }
`

const ADD_PROPOSAL_QUERY = graphql`
  query ProposalsListAddProposalQuery($id: ID!, $stepId: ID!, $isAuthenticated: Boolean!, $token: String) {
    node(id: $id) {
      ... on Proposal {
        id
        ...ProposalPreviewCard_proposal @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated, token: $token)
      }
    }
  }
`

type Props = {
  stepId: string
  showImages: boolean
}

export const List = ({
  hasNext,
  children,
  id,
  loadCount = 0,
  loadNext,
}: {
  hasNext?: boolean
  children: JSX.Element | JSX.Element[] | string
  loadCount?: number
  id: string
  loadNext?: (arg0: number) => {}
}) => {
  const isMobile = useIsMobile()
  return (
    <Box
      maxHeight={['100%', 'unset']}
      overflowY={['scroll', 'hidden']}
      pt={0}
      pb={[8, '']}
      id={id}
      pr={[4, 4, 8]}
      pl={[4, 2, 6]}
      sx={{ 'li': { listStyle: 'none' } }}
    >
      <InfiniteScroll
        key="infinite-scroll-proposals"
        element="ul"
        initialLoad={false}
        pageStart={0}
        loadMore={() => {
          if (loadNext) loadNext(loadCount)
        }}
        hasMore={hasNext}
        loader={
          <Flex direction="row" justify="center" key={0}>
            <Spinner size={CapUIIconSize.Md} />
          </Flex>
        }
        useWindow={!isMobile}
      >
        {children}
      </InfiniteScroll>
    </Box>
  )
}

export const ProposalsList = ({ stepId, showImages }: Props) => {
  const isMobile = useIsMobile()
  const isAuthenticated = useSelector((state: State) => state.user.user !== null)
  const [animateCard, setAnimateCard] = React.useState(false)
  const LOAD_PROPOSAL_COUNT = isMobile ? 25 : 50
  const { filters, view } = useVoteStepContext()
  const { sort, userType, theme, category, district, status, term, latlngBounds } = filters
  const geoBoundingBox = !isMobile && latlngBounds && view === View.Map ? parseLatLngBounds(latlngBounds) : null

  // hack to refetch list when participant store token in cookie for the first time
  useVoteStepFilters(stepId)

  const query = useLazyLoadQuery<ProposalsListQueryType>(
    QUERY,
    {
      stepId,
      count: LOAD_PROPOSAL_COUNT,
      cursor: null,
      orderBy: getOrderByArgs(sort) || [
        {
          field: 'RANDOM',
          direction: 'ASC',
        },
      ],
      userType: userType || null,
      theme: theme || null,
      category: category || null,
      district: district || null,
      status: status || null,
      geoBoundingBox,
      term: term || null,
      isAuthenticated,
      token: CookieMonster.getParticipantCookie(),
    },
    {
      fetchPolicy: 'network-only',
    },
  )
  const [hoveredProposalId, setHoveredProposalId] = React.useState(null)
  const { data, loadNext, hasNext } = usePaginationFragment<ProposalsListQueryType, ProposalsList_step$key>(
    FRAGMENT,
    query.voteStep,
  )

  const scrollTo = (proposalId: string) => {
    const hoveredProposalCard = document.getElementById(`proposal-${proposalId || ''}`)
    const proposalsList = document.getElementById('proposals-list')

    if (hoveredProposalCard && proposalsList) {
      window.scrollTo({
        top: hoveredProposalCard.offsetTop,
        behavior: 'smooth',
      })
      setHoveredProposalId(proposalId)
      return true
    }

    return false
  }

  useEventListener(VoteStepEvent.ClickProposal, (e: MessageEvent) => {
    const proposalId = e?.data?.id

    if (!proposalId) {
      setHoveredProposalId(null)
      return
    }

    if (!scrollTo(proposalId)) {
      const connectionName = data?.proposals?.__id || ''
      fetchQuery(
        environment as any,
        ADD_PROPOSAL_QUERY,
        {
          id: proposalId,
          stepId,
          isAuthenticated,
        },
        {
          fetchPolicy: 'store-or-network',
        },
      )
        .toPromise()
        .then(() => {
          commitLocalUpdate(environment as any, store => {
            const connectionRecord = store.get(connectionName)
            const newProposalRecord = store.get(proposalId)

            if (connectionRecord && newProposalRecord) {
              const newEdge = ConnectionHandler.createEdge(store, connectionRecord, newProposalRecord, 'ProposalEdge')
              ConnectionHandler.insertEdgeAfter(connectionRecord, newEdge)
              setTimeout(() => scrollTo(proposalId), DELAY_BEFORE_PROPOSAL_REMOVAL)
            }
          })
        })
    }
  })

  useEventListener(VoteStepEvent.AnimateCard, () => setAnimateCard(true))
  useEventListener(VoteStepEvent.AddVote, () => {
    setTimeout(() => setAnimateCard(false), DELAY_BEFORE_PROPOSAL_REMOVAL * 1000 * 2)
  })

  if (!data || !data.proposals) return null
  const proposals = data.proposals.edges?.map(edge => edge?.node).filter(Boolean)
  if (!proposals.length)
    return (
      <List id="empty-list">
        <EmptyList showMap={!showImages} noData={!data.proposalsCount.totalCount} />
      </List>
    )

  return (
    <List hasNext={hasNext} loadNext={loadNext} id="proposals-list" loadCount={LOAD_PROPOSAL_COUNT}>
      {/** @ts-ignore MAJ framer-motion */}
      <AnimatePresence initial={false}>
        {proposals.map(proposal => (
          <motion.li
            className={`motion-${view}`}
            key={`${proposal.id}-proposalList`}
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
              viewer={query.viewer}
              step={query.voteStep}
              showImage={showImages}
              isHighlighted={hoveredProposalId === proposal.id}
              stepId={stepId}
              disabled={!query?.voteStep?.open}
              fullSize={showImages}
            />
          </motion.li>
        ))}
      </AnimatePresence>
    </List>
  )
}
export default ProposalsList
