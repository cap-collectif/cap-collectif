// @flow
import * as React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { createPaginationContainer, graphql, type RelayPaginationProp } from 'react-relay';
import { useIntl } from 'react-intl';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import DebateVote from '~/components/Admin/Debate/DebateVote/DebateVote';
import type { DebateVote_vote$ref } from '~relay/DebateVote_vote.graphql';
import type { ForOrAgainstValue, VoteTab_debate } from '~relay/VoteTab_debate.graphql';
import AppBox from '~ui/Primitives/AppBox';
import Spinner from '~ds/Spinner/Spinner';
import SpotIcon, { SPOT_ICON_NAME } from '~ds/SpotIcon/SpotIcon';
import Button from '~ds/Button/Button';

export const VOTE_PAGINATION = 10;

const MAX_HEIGHT_8_VOTES = 500;

type Vote = {|
  +id: string,
  +type: ForOrAgainstValue,
  +$fragmentRefs: DebateVote_vote$ref,
|};

type VotesForAndAgainst = {|
  FOR: Vote[],
  AGAINST: Vote[],
|};

type Props = {|
  debate: VoteTab_debate,
  +relay: RelayPaginationProp,
|};

const formatVotesForAndAgainst = (
  debateVotes: $PropertyType<VoteTab_debate, 'debateVotes'>,
): VotesForAndAgainst => {
  const defaultForAndAgainstVotes = { FOR: [], AGAINST: [] };

  if (debateVotes.totalCount === 0) {
    return defaultForAndAgainstVotes;
  }

  return debateVotes?.edges
    ? debateVotes.edges
        .filter(Boolean)
        .map(edge => edge && edge.node)
        .reduce(
          (acc, vote) => ({
            FOR: vote?.type === 'FOR' ? [...acc.FOR, vote] : acc.FOR,
            AGAINST: vote?.type === 'AGAINST' ? [...acc.AGAINST, vote] : acc.AGAINST,
          }),
          defaultForAndAgainstVotes,
        )
    : defaultForAndAgainstVotes;
};

export const VoteTab = ({ debate, relay }: Props) => {
  const { debateVotes, debateVotesFor, debateVotesAgainst } = debate;
  const intl = useIntl();
  const hasVotes = debateVotes.totalCount > 0;
  const listVoteRef = React.useRef(null);

  const { FOR: votesFor, AGAINST: votesAgainst } = React.useMemo(
    () => formatVotesForAndAgainst(debateVotes),
    [debateVotes],
  );
  const exportUrl = `/debate/${debate.id}/download/votes`;

  return hasVotes ? (
    <Flex direction="column">
      <Flex direction="row" justify="space-between" align="center" mb={4}>
        <Text color="gray.700">
          {intl.formatMessage(
            { id: 'vote-count-for-and-against' },
            { for: debateVotesFor.totalCount, against: debateVotesAgainst.totalCount },
          )}
        </Text>

        <Button
          variant="primary"
          variantColor="primary"
          variantSize="small"
          onClick={() => {
            window.location.href = exportUrl;
          }}
          aria-label={intl.formatMessage({ id: 'global.export' })}>
          {intl.formatMessage({ id: 'global.export' })}
        </Button>
      </Flex>

      <Flex
        direction="column"
        ref={listVoteRef}
        css={{ overflow: 'auto', maxHeight: `${MAX_HEIGHT_8_VOTES}px` }}>
        <InfiniteScroll
          key="infinite-scroll-vote"
          initialLoad={false}
          pageStart={0}
          loadMore={() => relay.loadMore(VOTE_PAGINATION)}
          hasMore={debate.debateVotes?.pageInfo.hasNextPage}
          loader={
            <Flex direction="row" justify="center">
              <Spinner size="m" />
            </Flex>
          }
          getScrollParent={() => listVoteRef.current}
          useWindow={false}>
          <Flex direction="row" align="stretch">
            {votesFor.length > 0 ? (
              <AppBox
                as="ul"
                p={0}
                m={0}
                pr={7}
                flex="1"
                borderRight="normal"
                borderColor="gray.200"
                css={{ listStyle: 'none' }}>
                {votesFor.map(vote => (
                  <AppBox as="li" key={vote.id} mb={4}>
                    <DebateVote vote={vote} />
                  </AppBox>
                ))}
              </AppBox>
            ) : (
              <Flex
                direction="column"
                align="center"
                flex="1"
                textAlign="center"
                borderRight="normal"
                borderColor="gray.200">
                <SpotIcon name={SPOT_ICON_NAME.RATING_CLICK} size="sm" />
                <Text color="gray.500" maxWidth="200px">
                  {intl.formatMessage({ id: 'no-argument-for-published-yet' })}
                </Text>
              </Flex>
            )}

            {votesAgainst.length > 0 ? (
              <AppBox as="ul" p={0} m={0} ml={7} flex="1" css={{ listStyle: 'none' }}>
                {votesAgainst.map(vote => (
                  <AppBox as="li" key={vote.id} mb={4}>
                    <DebateVote vote={vote} />
                  </AppBox>
                ))}
              </AppBox>
            ) : (
              <Flex direction="column" align="center" textAlign="center" flex="1">
                <SpotIcon name={SPOT_ICON_NAME.RATING_CLICK} size="sm" />
                <Text color="gray.500" maxWidth="200px">
                  {intl.formatMessage({ id: 'no-argument-against-published-yet' })}
                </Text>
              </Flex>
            )}
          </Flex>
        </InfiniteScroll>
      </Flex>
    </Flex>
  ) : (
    <Flex direction="column" spacing={6} align="center">
      <SpotIcon name={SPOT_ICON_NAME.RATING_CLICK} size="lg" />
      <Text color="gray.500">{intl.formatMessage({ id: 'debate.empty.votes.section' })}</Text>
    </Flex>
  );
};

export default createPaginationContainer(
  VoteTab,
  {
    debate: graphql`
      fragment VoteTab_debate on Debate
        @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" }) {
        id
        debateVotes: votes(first: $count, after: $cursor)
          @connection(key: "VoteTab_debateVotes", filters: []) {
          totalCount
          pageInfo {
            hasNextPage
          }
          edges {
            cursor
            node {
              id
              type
              ...DebateVote_vote
            }
          }
        }
        debateVotesFor: votes(type: FOR) {
          totalCount
        }
        debateVotesAgainst: votes(type: AGAINST) {
          totalCount
        }
      }
    `,
  },
  {
    direction: 'forward',
    /*
     * Based on node_modules/react-relay/ReactRelayPaginationContainer.js.flow, when I ask something
     * in the pageInfo node, it forces me to include everything (e.g hasPrevPage, startCursor and
     * endCursor) but I only need `hasNextPage`
     * $FlowFixMe
     * */
    getConnectionFromProps(props: Props) {
      return props.debate && props.debate.debateVotes;
    },
    getFragmentVariables(prevVars) {
      return {
        ...prevVars,
      };
    },
    getVariables(
      props: Props,
      { count, cursor }: { count: number, cursor: ?string },
      fragmentVariables: {
        count: number,
        cursor: ?string,
        debateId: string,
      },
    ) {
      return {
        ...fragmentVariables,
        count,
        cursor,
        debateId: props.debate.id,
      };
    },
    query: graphql`
      query VoteTabPaginatedQuery($debateId: ID!, $count: Int!, $cursor: String) {
        debate: node(id: $debateId) {
          ...VoteTab_debate @arguments(count: $count, cursor: $cursor)
        }
      }
    `,
  },
);
