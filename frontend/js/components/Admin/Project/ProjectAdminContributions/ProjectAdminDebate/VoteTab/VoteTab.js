// @flow
import * as React from 'react';
import moment from 'moment';
import { createPaginationContainer, graphql, type RelayPaginationProp } from 'react-relay';
import { useIntl, type IntlShape } from 'react-intl';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import type { ContributionOrigin, VoteTab_debate } from '~relay/VoteTab_debate.graphql';
import type { VoteTab_debateStep } from '~relay/VoteTab_debateStep.graphql';
import SpotIcon, { SPOT_ICON_NAME } from '~ds/SpotIcon/SpotIcon';
import Table from '~ds/Table';
import Link from '~ds/Link/Link';
import Tag from '~ds/Tag/Tag';
import Tooltip from '~ds/Tooltip/Tooltip';
import ConditionalWrapper from '~/components/Utils/ConditionalWrapper';

export const VOTE_PAGINATION = 10;

type Props = {|
  debate: VoteTab_debate,
  debateStep: VoteTab_debateStep,
  +relay: RelayPaginationProp,
|};

const getWordingOrigin = (origin: ContributionOrigin, intl: IntlShape): string => {
  if (origin === 'INTERNAL') return intl.formatMessage({ id: 'global.application' });
  if (origin === 'WIDGET') return intl.formatMessage({ id: 'global.widget' });
  if (origin === 'MAIL') return intl.formatMessage({ id: 'share.mail' });
  return '';
};

export const VoteTab = ({ debate, debateStep, relay }: Props) => {
  const { debateVotes } = debate;
  const intl = useIntl();
  const hasVotes = debateVotes.totalCount > 0;
  const isStepClosed = debateStep?.timeRange?.hasEnded;

  return hasVotes ? (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>{intl.formatMessage({ id: 'admin.fields.comment_vote.voter' })}</Table.Th>
          <Table.Th>{intl.formatMessage({ id: 'global.source' })}</Table.Th>
          <Table.Th>{intl.formatMessage({ id: 'vote.type' })}</Table.Th>
          <Table.Th>{intl.formatMessage({ id: 'global.publication' })}</Table.Th>
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody
        useInfiniteScroll={hasVotes}
        onScrollToBottom={() => {
          relay.loadMore(VOTE_PAGINATION);
        }}
        hasMore={debate.debateVotes?.pageInfo.hasNextPage}>
        {debateVotes?.edges
          ?.filter(Boolean)
          .map(edge => edge && edge.node)
          .filter(Boolean)
          .map(vote => (
            <Table.Tr key={vote.id} rowId={vote.id} verticalAlign="top">
              <Table.Td>
                {vote.author
                  ? vote.author.username
                  : intl.formatMessage({ id: 'global.anonymous' })}
              </Table.Td>

              <Table.Td>
                <Text>{getWordingOrigin(vote.origin, intl)}</Text>
                {vote.origin === 'INTERNAL' && (
                  <Link href={debate.url} variant="hierarchy" truncate={50} target="_blank">
                    {debate.url}
                  </Link>
                )}
                {vote.origin === 'WIDGET' && vote.widgetOriginUrl && (
                  <Link
                    href={vote.widgetOriginUrl}
                    variant="hierarchy"
                    truncate={50}
                    target="_blank">
                    {vote.widgetOriginUrl}
                  </Link>
                )}
                {(vote.origin === 'MAIL' ||
                  (vote.origin === 'WIDGET' && !vote.widgetOriginUrl)) && (
                  <Text color="gray.500">-</Text>
                )}
              </Table.Td>

              <Table.Td>
                <Tag variant={vote.type === 'FOR' ? 'green' : 'red'} interactive={false}>
                  {intl.formatMessage({
                    id:
                      vote.type === 'FOR' ? 'argument.show.type.for' : 'argument.show.type.against',
                  })}
                </Tag>
              </Table.Td>

              <Table.Td>
                <ConditionalWrapper
                  when={!vote.published}
                  wrapper={children => (
                    <Tooltip
                      label={intl.formatMessage({
                        id: isStepClosed
                          ? 'account-not-confirmed-before-end-stop'
                          : 'waiting-for-user-email-confirmation',
                      })}>
                      {children}
                    </Tooltip>
                  )}>
                  <Text display="inline-block">
                    {vote.published
                      ? intl.formatMessage({ id: 'global.published' })
                      : intl.formatMessage({
                          id: isStepClosed ? 'global.no.published' : 'waiting',
                        })}
                  </Text>
                </ConditionalWrapper>

                <Text color="gray.500">
                  {intl.formatDate(moment(vote.published ? vote.publishedAt : vote.createdAt), {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                  })}
                </Text>
              </Table.Td>
            </Table.Tr>
          ))}
      </Table.Tbody>
    </Table>
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
        @argumentDefinitions(
          count: { type: "Int!" }
          cursor: { type: "String" }
          isPublished: { type: "Boolean" }
        ) {
        id
        url
        debateVotes: votes(first: $count, after: $cursor, isPublished: $isPublished)
          @connection(key: "VoteTab_debateVotes", filters: ["isPublished"]) {
          totalCount
          pageInfo {
            hasNextPage
          }
          edges {
            cursor
            node {
              id
              type
              published
              publishedAt
              createdAt
              origin
              widgetOriginUrl
              ... on DebateVote {
                author {
                  username
                }
              }
            }
          }
        }
      }
    `,
    debateStep: graphql`
      fragment VoteTab_debateStep on Step {
        id
        timeRange {
          hasEnded
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
      return prevVars;
    },
    getVariables(
      props: Props,
      { count, cursor }: { count: number, cursor: ?string },
      fragmentVariables: {
        count: number,
        cursor: ?string,
        debateId: string,
        stepId: string,
      },
    ) {
      return {
        ...fragmentVariables,
        count,
        cursor,
        debateId: props.debate.id,
        stepId: props.debateStep.id,
      };
    },
    query: graphql`
      query VoteTabPaginatedQuery(
        $debateId: ID!
        $stepId: ID!
        $count: Int!
        $cursor: String
        $isPublished: Boolean
      ) {
        debate: node(id: $debateId) {
          ...VoteTab_debate @arguments(count: $count, cursor: $cursor, isPublished: $isPublished)
        }
        debateStep: node(id: $stepId) {
          ...VoteTab_debateStep
        }
      }
    `,
  },
);
