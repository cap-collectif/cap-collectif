// @flow
import * as React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Box, Flex, Spinner } from '@cap-collectif/ui';
import { AnimatePresence, m as motion } from 'framer-motion';
import {
  useLazyLoadQuery,
  graphql,
  usePaginationFragment,
  fetchQuery,
  commitLocalUpdate,
} from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import type { ProposalsListQuery as ProposalsListQueryType } from '~relay/ProposalsListQuery.graphql';
import ProposalPreviewCard from './ProposalPreviewCard';
import { useEventListener } from '~/utils/hooks/useEventListener';
import useIsMobile from '~/utils/hooks/useIsMobile';
import environment from '~/createRelayEnvironment';
import { useVoteStepContext } from '~/components/VoteStep/Context/VoteStepContext';
import {
  DELAY_BEFORE_PROPOSAL_REMOVAL,
  VoteStepEvent,
  getOrderByArgs,
  View,
  parseLatLngBounds,
} from '../utils';
import EmptyList from './EmptyList';

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
  ) {
    voteStep: node(id: $stepId) {
      ... on SelectionStep {
        open
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
          )
      }
    }
  }
`;

const FRAGMENT = graphql`
  fragment ProposalsList_step on SelectionStep
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
      excludeViewerVotes: true
      geoBoundingBox: $geoBoundingBox
      term: $term
    ) @connection(key: "ProposalsList_proposals", filters: []) {
      __id
      edges {
        node {
          id
          ...ProposalPreviewCard_proposal @arguments(stepId: $stepId)
        }
      }
    }
  }
`;

const ADD_PROPOSAL_QUERY = graphql`
  query ProposalsListAddProposalQuery($id: ID!, $stepId: ID!) {
    node(id: $id) {
      ... on Proposal {
        id
        ...ProposalPreviewCard_proposal @arguments(stepId: $stepId)
      }
    }
  }
`;

type Props = {|
  +stepId: string,
  +showImages: boolean,
|};

export const List = ({
  hasNext,
  children,
  id,
  loadCount,
  loadNext,
}: {|
  +hasNext: boolean,
  +children: React.Node,
  loadCount: number,
  id: string,
  loadNext: number => {},
|}) => {
  const isMobile = useIsMobile();

  return (
    <Box
      maxHeight={['100%', 'unset']}
      overflowY={['scroll', 'hidden']}
      pt={['7rem', 0]}
      px={[4, 8]}
      pb={[8, '']}
      id={id}>
      <InfiniteScroll
        key="infinite-scroll-proposals"
        initialLoad={false}
        pageStart={0}
        loadMore={() => loadNext(loadCount)}
        hasMore={hasNext}
        loader={
          <Flex direction="row" justify="center" key={0}>
            <Spinner size="m" />
          </Flex>
        }
        useWindow={!isMobile}>
        {children}
      </InfiniteScroll>
    </Box>
  );
};

export const ProposalsList = ({ stepId, showImages }: Props) => {
  const isMobile = useIsMobile();
  const [animateCard, setAnimateCard] = React.useState(false);

  const LOAD_PROPOSAL_COUNT = isMobile ? 25 : 50;

  const { filters, view } = useVoteStepContext();
  const { sort, userType, theme, category, district, status, term, latlngBounds } = filters;

  const geoBoundingBox =
    !isMobile && latlngBounds && view === View.Map ? parseLatLngBounds(latlngBounds) : null;

  const query = useLazyLoadQuery<ProposalsListQueryType>(
    QUERY,
    {
      stepId,
      count: LOAD_PROPOSAL_COUNT,
      cursor: null,
      orderBy: getOrderByArgs(sort) || [{ field: 'RANDOM', direction: 'ASC' }],
      userType: userType || null,
      theme: theme || null,
      category: category || null,
      district: district || null,
      status: status || null,
      geoBoundingBox,
      term: term || null,
    },
    { fetchPolicy: 'network-only' },
  );

  const [hoveredProposalId, setHoveredProposalId] = React.useState(null);

  const { data, loadNext, hasNext } = usePaginationFragment(FRAGMENT, query.voteStep);

  const scrollTo = (proposalId: string) => {
    const hoveredProposalCard = document.getElementById(`proposal-${proposalId || ''}`);
    const proposalsList = document.getElementById('proposals-list');
    if (hoveredProposalCard && proposalsList) {
      window.scrollTo({ top: hoveredProposalCard.offsetTop - 200, behavior: 'smooth' });
      setHoveredProposalId(proposalId);
      return true;
    }
    return false;
  };

  useEventListener(VoteStepEvent.ClickProposal, e => {
    // $FlowFixMe Event type is too strict in flow
    const proposalId = e?.data?.id;
    if (!proposalId) {
      setHoveredProposalId(null);
      return;
    }
    if (!scrollTo(proposalId)) {
      const connectionName = data?.proposals?.__id || '';
      fetchQuery(
        environment,
        ADD_PROPOSAL_QUERY,
        { id: proposalId, stepId },
        { fetchPolicy: 'store-or-network' },
      )
        .toPromise()
        .then(() => {
          commitLocalUpdate(environment, store => {
            const connectionRecord = store.get(connectionName);
            const newProposalRecord = store.get(proposalId);
            if (connectionRecord && newProposalRecord) {
              const newEdge = ConnectionHandler.createEdge(
                store,
                connectionRecord,
                newProposalRecord,
                'ProposalEdge',
              );
              ConnectionHandler.insertEdgeAfter(connectionRecord, newEdge);
              setTimeout(() => scrollTo(proposalId), DELAY_BEFORE_PROPOSAL_REMOVAL);
            }
          });
        });
    }
  });

  useEventListener(VoteStepEvent.AnimateCard, () => setAnimateCard(true));
  useEventListener(VoteStepEvent.AddVote, () => {
    setTimeout(() => setAnimateCard(false), DELAY_BEFORE_PROPOSAL_REMOVAL * 1000 * 2);
  });

  if (!data || !data.proposals) return null;

  const proposals = data.proposals.edges?.map(edge => edge?.node).filter(Boolean);

  if (!proposals.length) return <EmptyList />;

  return (
    <List hasNext={hasNext} loadNext={loadNext} id="proposals-list" loadCount={LOAD_PROPOSAL_COUNT}>
      <AnimatePresence initial={false}>
        {proposals.map(proposal => (
          <motion.div
            className={`motion-${view}`}
            key={`${proposal.id}-proposalList`}
            initial={{ opacity: 1, height: 'auto', marginBottom: '1.7rem' }}
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
            }}>
            <ProposalPreviewCard
              proposal={proposal}
              showImage={showImages}
              isHighlighted={hoveredProposalId === proposal.id}
              hasVoted={false}
              stepId={stepId}
              disabled={!query?.voteStep?.open}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </List>
  );
};

export default ProposalsList;
