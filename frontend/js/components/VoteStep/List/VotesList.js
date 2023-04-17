// @flow
import * as React from 'react';
import { useLazyLoadQuery, graphql, usePaginationFragment } from 'react-relay';
import type { VotesListQuery as VotesListQueryType } from '~relay/VotesListQuery.graphql';
import ProposalPreviewCard from './ProposalPreviewCard';
import useIsMobile from '~/utils/hooks/useIsMobile';
import { List } from './ProposalsList';

const QUERY = graphql`
  query VotesListQuery($stepId: ID!, $count: Int!, $cursor: String) {
    voteStep: node(id: $stepId) {
      ... on SelectionStep {
        ...VotesList_step @arguments(count: $count, cursor: $cursor)
      }
    }
  }
`;

const FRAGMENT = graphql`
  fragment VotesList_step on SelectionStep
  @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" })
  @refetchable(queryName: "VotesListPaginationQuery") {
    viewerVotes(first: $count, after: $cursor)
      @connection(key: "VotesList_viewerVotes", filters: ["query", "orderBy"]) {
      edges {
        node {
          id
          proposal {
            ...ProposalPreviewCard_proposal
          }
        }
      }
    }
  }
`;

type Props = {|
  +stepId: string,
|};

export const VotesList = ({ stepId }: Props) => {
  const isMobile = useIsMobile();

  const LOAD_PROPOSAL_COUNT = isMobile ? 25 : 50;

  const query = useLazyLoadQuery<VotesListQueryType>(
    QUERY,
    {
      stepId,
      count: LOAD_PROPOSAL_COUNT,
      cursor: null,
    },
    { fetchPolicy: 'store-and-network' },
  );

  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(
    FRAGMENT,
    query.voteStep,
  );

  if (!data || !data.viewerVotes) return null;

  const viewerVotes = data.viewerVotes.edges?.map(edge => edge?.node?.proposal).filter(Boolean);

  return (
    <List
      hasNext={hasNext}
      loadNext={loadNext}
      isLoadingNext={isLoadingNext}
      id="votes-list"
      loadCount={LOAD_PROPOSAL_COUNT}>
      {viewerVotes.map(proposal => (
        <ProposalPreviewCard proposal={proposal} key={proposal.id} showImage />
      ))}
    </List>
  );
};

export default VotesList;
