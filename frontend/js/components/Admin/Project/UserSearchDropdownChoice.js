// @flow
import React from 'react';
import { connect } from 'react-redux';
import styled, { type StyledComponent } from 'styled-components';
import { useIntl } from 'react-intl';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import type { UserSearchDropdownChoice_user } from '~relay/UserSearchDropdownChoice_user.graphql';
import DropdownSelectChoice from '~ui/DropdownSelect/choice';
import UserAvatarLegacy from '~/components/User/UserAvatarLegacy';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import { TYPE_ROLE } from '~/constants/AnalyseConstants';
import type { GlobalState } from '~/types';

type Props = {|
  +isIndeterminate?: boolean,
  +user: UserSearchDropdownChoice_user,
  +disabled?: boolean,
  +type: $Values<typeof TYPE_ROLE>,
  +emailNotification: string,
|};

const UserSearchDropdownChoiceContainer: StyledComponent<
  {},
  {},
  typeof DropdownSelectChoice,
> = styled(DropdownSelectChoice)`
  & > span {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex: 1;
  }

  img {
    margin-right: 8px;
    border-radius: 100%;
  }
`;

const UserSearchDropdownChoice = ({
  user,
  isIndeterminate = false,
  disabled = false,
  type,
  emailNotification,
}: Props) => {
  const intl = useIntl();

  return (
    <UserSearchDropdownChoiceContainer
      isIndeterminate={isIndeterminate}
      value={user.id}
      disabled={disabled}>
      <div>
        <UserAvatarLegacy user={user} displayUrl={false} size={18} />
        <span>{user.username}</span>
      </div>

      {disabled && (
        <OverlayTrigger
          key="explication"
          placement="top"
          overlay={
            <Tooltip id="tooltip-disabled">
              {intl.formatMessage(
                {
                  id:
                    type === TYPE_ROLE.SUPERVISOR
                      ? 'tooltip.help.text.unassign.supervisor'
                      : 'tooltip.help.text.unassign.analyst',
                },
                { email: emailNotification },
              )}
            </Tooltip>
          }>
          <Icon name={ICON_NAME.warning} size="15" />
        </OverlayTrigger>
      )}
    </UserSearchDropdownChoiceContainer>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  emailNotification: state.default.parameters['admin.mail.notifications.receive_address'],
});
const container = connect<any, any, _, _, _, _>(mapStateToProps)(UserSearchDropdownChoice);

export default createFragmentContainer(container, {
  user: graphql`
    fragment UserSearchDropdownChoice_user on User {
      id
      username
      ...UserAvatar_user
    }
  `,
});
