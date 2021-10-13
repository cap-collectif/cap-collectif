// @flow
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  usePreloadedQuery,
  graphql,
  type PreloadedQuery,
  type GraphQLTaggedNode,
} from 'react-relay';
import type { UserInviteAdminPageQuery as UserInviteAdminPageQueryType } from '~relay/UserInviteAdminPageQuery.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import { headingStyles } from '~ui/Primitives/Heading';
import { FontWeight } from '~ui/Primitives/constants';
import Text from '~ui/Primitives/Text';
import UserInviteList from '~/components/Admin/UserInvite/UserInviteList';
import TablePlaceholder from '~ds/Table/placeholder';
import Input from '~ui/Form/Input/Input';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import Button from '~ds/Button/Button';
import UserInviteByFileModal from '~/components/Admin/UserInvite/Modal/UserInviteByFile/UserInviteByFileModal';
import UserInviteByEmailModal from '~/components/Admin/UserInvite/Modal/UserInviteByEmail/UserInviteByEmailModal';

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
    ...UserInviteList_query @arguments(first: $first, cursor: $cursor, term: $term, status: $status)
    ...UserInviteModalStepChooseRole_query
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

  return (
    <Flex direction="column" spacing={3}>
      <Text
        color="blue.800"
        {...headingStyles.h4}
        fontWeight={FontWeight.Semibold}
        px={6}
        py={4}
        bg="white">
        {intl.formatMessage({ id: 'user-invite-admin-page-title' })}
      </Text>

      <Flex
        direction="column"
        p={8}
        spacing={4}
        m={6}
        bg="white"
        borderRadius="normal"
        overflow="hidden">
        <Flex direction="row">
          <ButtonGroup>
            <UserInviteByFileModal
              queryFragment={query}
              disclosure={
                <Button variant="secondary" variantSize="small">
                  <FormattedMessage id="invite-via-file" />
                </Button>
              }
            />
            <UserInviteByEmailModal
              queryFragment={query}
              disclosure={
                <Button variant="secondary" variantSize="small">
                  <FormattedMessage id="invite-a-user" />
                </Button>
              }
            />
            <Input
              type="text"
              name="term"
              id="search-invitation"
              onChange={(e: SyntheticInputEvent<HTMLInputElement>) => setTerm(e.target.value)}
              value={term}
              placeholder={intl.formatMessage({ id: 'search-invitation' })}
            />
          </ButtonGroup>
        </Flex>
        <React.Suspense fallback={<TablePlaceholder rowsCount={8} columnsCount={4} />}>
          <UserInviteList query={query} status={status} setStatus={setStatus} term={term} />
        </React.Suspense>
      </Flex>
    </Flex>
  );
};

export default UserInviteAdminPage;
