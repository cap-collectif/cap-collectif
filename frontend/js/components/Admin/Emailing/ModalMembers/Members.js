// @flow
import * as React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { createPaginationContainer, graphql } from 'react-relay';
import type { RelayPaginationProp } from 'react-relay';
import { useIntl } from 'react-intl';
import type { Members_mailingList } from '~relay/Members_mailingList.graphql';
import AppBox from '~ui/Primitives/AppBox';
import Flex from '~ui/Primitives/Layout/Flex';
import Spinner from '~ds/Spinner/Spinner';
import InfoMessage from '~ds/InfoMessage/InfoMessage';

export const USERS_PAGINATION = 20;

type Props = {|
  +mailingList: Members_mailingList,
  +relay: RelayPaginationProp,
  +isAdmin: boolean,
|};

export const Members = ({ mailingList, relay }: Props) => {
  const listMembersRef = React.useRef(null);
  const refusingCount = mailingList.allMembers.totalCount - mailingList.members.totalCount;
  const intl = useIntl();

  return (
    <AppBox
      as="ul"
      p={0}
      m={0}
      css={{ listStyle: 'none', overflow: 'auto', maxHeight: '300px' }}
      ref={listMembersRef}>
      {refusingCount > 0 && (
        <InfoMessage variant="info" mb={6}>
          <InfoMessage.Title>
            {intl.formatMessage(
              { id: 'mailingList-refusing-members-count' },
              { num: refusingCount },
            )}
          </InfoMessage.Title>
          <InfoMessage.Content>
            {intl.formatMessage({ id: 'mailingList-refusing-members' })}
          </InfoMessage.Content>
        </InfoMessage>
      )}
      <InfiniteScroll
        key="infinite-scroll-internal-members"
        initialLoad={false}
        pageStart={0}
        loadMore={() => relay.loadMore(USERS_PAGINATION)}
        hasMore={mailingList.members.pageInfo.hasNextPage}
        loader={
          <Flex direction="row" justify="center" key={0}>
            <Spinner size="m" />
          </Flex>
        }
        getScrollParent={() => listMembersRef.current}
        useWindow={false}>
        {mailingList.members.edges
          ?.filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(member => (
            <AppBox as="li" key={member.id} mb={3}>
              {member.email ?? member.username}
            </AppBox>
          ))}
      </InfiniteScroll>
    </AppBox>
  );
};

export default createPaginationContainer(
  Members,
  {
    mailingList: graphql`
      fragment Members_mailingList on MailingList
      @argumentDefinitions(
        count: { type: "Int!" }
        cursor: { type: "String" }
        isAdmin: { type: "Boolean!" }
      ) {
        id
        allMembers: users(consentInternalCommunicationOnly: false) {
          totalCount
        }
        members: users(first: $count, after: $cursor, consentInternalCommunicationOnly: true)
          @connection(key: "Members_members", filters: []) {
          totalCount
          pageInfo {
            hasNextPage
          }
          edges {
            node {
              id
              email @include(if: $isAdmin)
              username
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
      return props.mailingList && props.mailingList.members;
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
        isAdmin: props.isAdmin,
        mailingListId: props.mailingList.id,
      };
    },
    query: graphql`
      query MembersPaginatedQuery(
        $mailingListId: ID!
        $count: Int!
        $cursor: String
        $isAdmin: Boolean!
      ) {
        mailingList: node(id: $mailingListId) {
          ...Members_mailingList @arguments(count: $count, cursor: $cursor, isAdmin: $isAdmin)
        }
      }
    `,
  },
);
