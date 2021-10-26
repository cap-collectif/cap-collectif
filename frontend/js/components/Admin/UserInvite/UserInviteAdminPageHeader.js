// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import Flex from '~ui/Primitives/Layout/Flex';
import Input from '~ui/Form/Input/Input';
import ModalStepsUserInvitation from '~/components/Admin/UserInvite/Modal/UserInviteModalSteps';
import type { UserInviteAdminPageHeader_groups$key } from '~relay/UserInviteAdminPageHeader_groups.graphql';

type Props = {|
  +groups: UserInviteAdminPageHeader_groups$key,
  +term: string,
  +setTerm: (term: string) => void,
|};

const FRAGMENT = graphql`
  fragment UserInviteAdminPageHeader_groups on Group @relay(plural: true) {
    ...UserInviteModalSteps_groups
  }
`;

const UserInviteAdminPageHeader = ({
  groups: groupsFragment,
  term,
  setTerm,
}: Props): React.Node => {
  const intl = useIntl();
  const groups = useFragment(FRAGMENT, groupsFragment);

  return (
    <Flex direction="row" spacing={4}>
      <ModalStepsUserInvitation groups={groups} intl={intl} />
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
