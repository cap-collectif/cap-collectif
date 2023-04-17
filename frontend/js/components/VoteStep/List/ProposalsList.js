// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { Box, Button, Flex } from '@cap-collectif/ui';
import { useLazyLoadQuery, graphql, usePaginationFragment } from 'react-relay';
import type { ProposalsListQuery as ProposalsListQueryType } from '~relay/ProposalsListQuery.graphql';
import ProposalPreviewCard from './ProposalPreviewCard';
import { useEventListener } from '~/utils/hooks/useEventListener';
import useIsMobile from '~/utils/hooks/useIsMobile';

const QUERY = graphql`
  query ProposalsListQuery($stepId: ID!, $count: Int!, $cursor: String) {
    voteStep: node(id: $stepId) {
      ... on SelectionStep {
        ...ProposalsList_step @arguments(count: $count, cursor: $cursor)
      }
    }
  }
`;

const FRAGMENT = graphql`
  fragment ProposalsList_step on SelectionStep
  @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" })
  @refetchable(queryName: "ProposalsListPaginationQuery") {
    proposals(first: $count, after: $cursor)
      @connection(key: "ProposalsList_proposals", filters: ["query", "orderBy"]) {
      edges {
        node {
          id
          ...ProposalPreviewCard_proposal
        }
      }
    }
  }
`;

type Props = {|
  +stepId: string,
  +showImages: boolean,
|};

export const ProposalsList = ({ stepId, showImages }: Props) => {
  const intl = useIntl();
  const isMobile = useIsMobile();

  const LOAD_PROPOSAL_COUNT = isMobile ? 25 : 50;

  const query = useLazyLoadQuery<ProposalsListQueryType>(
    QUERY,
    {
      stepId,
      count: LOAD_PROPOSAL_COUNT,
      cursor: null,
    },
    { fetchPolicy: 'store-and-network' },
  );

  const [hoveredProposalId, setHoveredProposalId] = React.useState(null);

  useEventListener('hover-proposal', e => {
    // $FlowFixMe Event type is too strict in flow
    const proposalId = e?.data?.id;
    const hoveredProposalCard = document.getElementById(`proposal-${proposalId || ''}`);
    const proposalsList = document.getElementById('proposals-list');
    if (hoveredProposalCard && proposalsList) {
      proposalsList.scrollTo({ top: hoveredProposalCard.offsetTop - 200, behavior: 'smooth' });
      setHoveredProposalId(proposalId);
    }
  });

  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(
    FRAGMENT,
    query.voteStep,
  );

  if (!data || !data.proposals) return null;

  const proposals = data.proposals.edges?.map(edge => edge?.node).filter(Boolean);

  return (
    <Box
      maxHeight={['100%', 'calc(100vh - 15rem)']}
      overflowY="scroll"
      pt={['7rem', 8]}
      px={[4, 8]}
      pb={[8, '']}
      id="proposals-list">
      {proposals.map(proposal => (
        <ProposalPreviewCard
          proposal={proposal}
          key={proposal.id}
          showImage={showImages}
          isHighlighted={hoveredProposalId === proposal.id}
        />
      ))}
      {hasNext ? (
        <Flex mt={6} mb={8}>
          <Button
            onClick={() => loadNext(LOAD_PROPOSAL_COUNT)}
            isLoading={isLoadingNext}
            margin="auto"
            variantSize="big"
            variantColor="hierarchy"
            variant="secondary">
            {intl.formatMessage({ id: 'global.more' })}
          </Button>
        </Flex>
      ) : null}
    </Box>
  );
};

export default ProposalsList;
