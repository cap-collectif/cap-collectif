// @flow
import * as React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { graphql, type GraphQLTaggedNode, usePaginationFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import type { GroupMembers_groupList$key } from '~relay/GroupMembers_groupList.graphql';
import AppBox from '~ui/Primitives/AppBox';
import Flex from '~ui/Primitives/Layout/Flex';
import Spinner from '~ds/Spinner/Spinner';
import InfoMessage from '~ds/InfoMessage/InfoMessage';

export const USERS_PAGINATION = 20;

export const GroupMembersQuery: GraphQLTaggedNode = graphql`
  fragment GroupMembers_groupList on Group
  @argumentDefinitions(
    count: { type: "Int!" }
    cursor: { type: "String" }
    isAdmin: { type: "Boolean!" }
  )
  @refetchable(queryName: "GroupMembersPaginationQuery") {
    id
    members: users(first: $count, after: $cursor, consentInternalCommunication: true)
      @connection(key: "GroupMembers_members", filters: []) {
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
    refusingMembers: users(consentInternalCommunication: false) {
      totalCount
    }
  }
`;

type Props = {|
  +groupList: GroupMembers_groupList$key,
  +isAdmin: boolean,
|};

export const GroupMembers = ({ groupList, isAdmin }: Props) => {
  const listGroupMembersRef = React.useRef(null);
  const intl = useIntl();
  const { data, loadNext, hasNext, refetch } = usePaginationFragment(GroupMembersQuery, groupList);
  const { members, refusingMembers } = data;
  const firstRendered = React.useRef(null);
  React.useEffect(() => {
    if (firstRendered.current) {
      refetch({
        isAdmin,
      });
    }

    firstRendered.current = true;
  }, [isAdmin, refetch]);

  return (
    <AppBox
      as="ul"
      p={0}
      m={0}
      css={{ listStyle: 'none', overflow: 'auto', maxHeight: '300px' }}
      ref={listGroupMembersRef}>
      {refusingMembers.totalCount > 0 && (
        <InfoMessage variant="info" mb={6}>
          <InfoMessage.Title>
            {intl.formatMessage(
              { id: 'mailingList-refusing-members-count' },
              { num: refusingMembers.totalCount },
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
        loadMore={() => loadNext(USERS_PAGINATION)}
        hasMore={hasNext}
        loader={
          <Flex direction="row" justify="center" key={0}>
            <Spinner size="m" />
          </Flex>
        }
        getScrollParent={() => listGroupMembersRef.current}
        useWindow={false}>
        {members.edges
          ?.filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(member => (
            <AppBox as="li" key={member.id} mb={3} color="gray.900" fontWeight="400">
              {member.email ?? member.username}
            </AppBox>
          ))}
      </InfiniteScroll>
    </AppBox>
  );
};

export default GroupMembers;
