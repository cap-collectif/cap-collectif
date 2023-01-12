// @flow
import * as React from 'react';
import type { RelayPaginationProp } from 'react-relay';
import InfiniteScroll from 'react-infinite-scroller';
import { createPaginationContainer, graphql } from 'react-relay';
import { useIntl } from 'react-intl';
import type { InternalMembers_query } from '~relay/InternalMembers_query.graphql';
import AppBox from '~ui/Primitives/AppBox';
import Flex from '~ui/Primitives/Layout/Flex';
import Spinner from '~ds/Spinner/Spinner';
import InfoMessage from '~ds/InfoMessage/InfoMessage';

export const USERS_PAGINATION = 20;

type Props = {|
  +query: InternalMembers_query,
  +relay: RelayPaginationProp,
|};

export const InternalMembers = ({ query, relay }: Props) => {
  const listMembersRef = React.useRef(null);
  const intl = useIntl();

  return (
    <AppBox
      as="ul"
      p={0}
      m={0}
      css={{ listStyle: 'none', overflow: 'auto', maxHeight: '300px' }}
      ref={listMembersRef}>
      {query.refusingMembers.totalCount > 0 && (
        <InfoMessage variant="info" mb={6}>
          <InfoMessage.Title>
            {intl.formatMessage(
              { id: 'mailingList-refusing-members-count' },
              { num: query.refusingMembers.totalCount },
            )}
          </InfoMessage.Title>
          <InfoMessage.Content>
            {intl.formatMessage(
              { id: 'mailingList-refusing-members' },
              { num: query.refusingMembers.totalCount },
            )}
          </InfoMessage.Content>
        </InfoMessage>
      )}
      <InfiniteScroll
        key="infinite-scroll-internal-members"
        initialLoad={false}
        pageStart={0}
        loadMore={() => relay.loadMore(USERS_PAGINATION)}
        hasMore={query.members.pageInfo.hasNextPage}
        loader={
          <Flex direction="row" justify="center" key={0}>
            <Spinner size="m" />
          </Flex>
        }
        getScrollParent={() => listMembersRef.current}
        useWindow={false}>
        {query.members.edges
          ?.filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(member => (
            <AppBox as="li" key={member.id} mb={3}>
              {member.email}
            </AppBox>
          ))}
      </InfiniteScroll>
    </AppBox>
  );
};

export default createPaginationContainer(
  InternalMembers,
  {
    query: graphql`
      fragment InternalMembers_query on Query
      @argumentDefinitions(
        count: { type: "Int!" }
        cursor: { type: "String" }
        emailConfirmed: { type: "Boolean" }
      ) {
        refusingMembers: users(consentInternalCommunication: false) {
          totalCount
        }
        members: users(
          first: $count
          after: $cursor
          emailConfirmed: $emailConfirmed
          consentInternalCommunication: true
        ) @connection(key: "InternalMembers_members", filters: []) {
          pageInfo {
            hasNextPage
          }
          edges {
            node {
              id
              email
            }
          }
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
      return props.query && props.query.members;
    },
    getFragmentVariables(prevVars) {
      return {
        ...prevVars,
      };
    },
    getVariables(props: Props, { count, cursor }, fragmentVariables) {
      return {
        ...fragmentVariables,
        count,
        cursor,
      };
    },
    query: graphql`
      query InternalMembersPaginatedQuery($count: Int!, $cursor: String, $emailConfirmed: Boolean) {
        ...InternalMembers_query
          @arguments(count: $count, cursor: $cursor, emailConfirmed: $emailConfirmed)
      }
    `,
  },
);
