// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import {
  usePreloadedQuery,
  graphql,
  type PreloadedQuery,
  type GraphQLTaggedNode,
} from 'react-relay';
import { type UserInviteAdminPageQuery as UserInviteAdminPageQueryType } from '~relay/UserInviteAdminPageQuery.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import { headingStyles } from '~ui/Primitives/Heading';
import { FontWeight } from '~ui/Primitives/constants';
import Text from '~ui/Primitives/Text';
import UserInviteList from '~/components/Admin/UserInvite/UserInviteList';
import TablePlaceholder from '~ds/Table/placeholder';
import UserInviteAdminPageHeader from '~/components/Admin/UserInvite/UserInviteAdminPageHeader';

type Props = {|
  queryReference: PreloadedQuery<UserInviteAdminPageQueryType>,
|};

export const UserInviteAdminPageQuery: GraphQLTaggedNode = graphql`
  query UserInviteAdminPageQuery(
    $first: Int
    $cursor: String
    $term: String
    $status: UserInviteStatus
  ) {
    allInvitations: userInvitations(first: 0) {
      totalCount
    }
    pendingInvitations: userInvitations(status: PENDING, first: 0) {
      totalCount
    }
    acceptedInvitations: userInvitations(status: ACCEPTED, first: 0) {
      totalCount
    }
    ...UserInviteList_query @arguments(first: $first, cursor: $cursor, term: $term, status: $status)
    groups {
      ...UserInviteAdminPageHeader_groups
    }
  }
`;

const UserInviteAdminPage = ({ queryReference }: Props): React.Node => {
  const intl = useIntl();
  const query = usePreloadedQuery<UserInviteAdminPageQueryType>(
    UserInviteAdminPageQuery,
    queryReference,
  );
  const [term, setTerm] = React.useState('');
  const [status, setStatus] = React.useState('ALL');
  const { allInvitations, pendingInvitations, acceptedInvitations } = query;

  return (
    <Flex direction="column" spacing={3}>
      <Flex direction="row" justify="space-between" align="center" px={6} py={4} bg="white">
        <Text color="blue.800" {...headingStyles.h4} fontWeight={FontWeight.Semibold}>
          {intl.formatMessage({ id: 'user-invite-admin-page-title' })}
        </Text>

        <Flex
          direction="row"
          color="blue.800"
          spacing={4}
          {...headingStyles.h5}
          fontWeight={FontWeight.Semibold}>
          <Text>
            <Text as="span" color="blue.500" mr={1}>
              {allInvitations.totalCount}
            </Text>
            {intl.formatMessage({ id: 'invitations-count' }, { num: allInvitations.totalCount })}
          </Text>

          <Text>
            <Text as="span" color="orange.500" mr={1}>
              {pendingInvitations.totalCount}
            </Text>
            {intl.formatMessage({ id: 'waiting' })}
          </Text>

          <Text>
            <Text as="span" color="green.500" mr={1}>
              {acceptedInvitations.totalCount}
            </Text>

            {intl.formatMessage(
              { id: 'accepted-invitations' },
              { num: acceptedInvitations.totalCount },
            )}
          </Text>
        </Flex>
      </Flex>

      <Flex
        direction="column"
        p={8}
        spacing={4}
        m={6}
        bg="white"
        borderRadius="normal"
        overflow="hidden">
        <UserInviteAdminPageHeader groups={query.groups} term={term} setTerm={setTerm} />
        <React.Suspense fallback={<TablePlaceholder rowsCount={8} columnsCount={4} />}>
          <UserInviteList query={query} status={status} setStatus={setStatus} term={term} />
        </React.Suspense>
      </Flex>
    </Flex>
  );
};

export default UserInviteAdminPage;
