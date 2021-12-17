// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import Flex from '~ui/Primitives/Layout/Flex';
import Input from '~ui/Form/Input/Input';
import ModalStepsUserInvitation from '~/components/Admin/UserInvite/Modal/UserInviteModalSteps';
import type { UserInviteAdminPageHeader_query$key } from '~relay/UserInviteAdminPageHeader_query.graphql';

type Props = {|
  +query: UserInviteAdminPageHeader_query$key,
  +term: string,
  +setTerm: (term: string) => void,
|};

const FRAGMENT = graphql`
  fragment UserInviteAdminPageHeader_query on Query {
    ...UserInviteModalSteps_query
  }
`;

const UserInviteAdminPageHeader = ({ query: queryFragment, term, setTerm }: Props): React.Node => {
  const intl = useIntl();
  const query = useFragment(FRAGMENT, queryFragment);

  return (
    <Flex direction="row" spacing={4}>
      <ModalStepsUserInvitation query={query} intl={intl} />
      <Input
        type="text"
        name="term"
        id="search-invitation"
        onChange={(e: SyntheticInputEvent<HTMLInputElement>) => setTerm(e.target.value)}
        value={term}
        placeholder={intl.formatMessage({ id: 'search-invitation' })}
      />
    </Flex>
  );
};

export default UserInviteAdminPageHeader;
