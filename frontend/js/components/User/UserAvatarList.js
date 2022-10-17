// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import styled, { type StyledComponent } from 'styled-components';
import { graphql, createFragmentContainer } from 'react-relay';

import UserAvatarList from '../Ui/List/UserAvatarList';
import UserAvatarLegacy from './UserAvatarLegacy';
import type { State, FeatureToggles } from '../../types';
import type { UserAvatarList_users } from '~relay/UserAvatarList_users.graphql';
import Tooltip from '~ds/Tooltip/Tooltip';

type Props = {|
  +users: UserAvatarList_users,
  +max: number,
  +avatarSize?: number,
  +onClick?: () => void,
  +features: FeatureToggles,
|};

const Button: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  border: none;
  background: transparent;
  padding-left: 0;
`;

export const UserAvatarListContainer = (props: Props) => {
  const { users, max, onClick, features, avatarSize } = props;

  const shouldRedirectProfile = users.length === 1 && features.profiles;

  return (
    <Button type="button" onClick={onClick}>
      <UserAvatarList avatarSize={avatarSize} max={max}>
        {users &&
          users.map((user, index) =>
            shouldRedirectProfile ? (
              <UserAvatarLegacy
                key={index}
                {...(avatarSize ? { size: avatarSize } : {})}
                user={user}
                features={features}
              />
            ) : (
              <Tooltip
                placement="top"
                label={user.username}
                id={`tooltip-${user.id}`}
                className="text-left"
                style={{ wordBreak: 'break-word' }}>
                <div>
                  <UserAvatarLegacy
                    {...(avatarSize ? { size: avatarSize } : {})}
                    user={user}
                    features={features}
                    displayUrl={false}
                  />
                </div>
              </Tooltip>
            ),
          )}
      </UserAvatarList>
    </Button>
  );
};

UserAvatarListContainer.defaultProps = {
  max: 5,
};

const mapStateToProps = (state: State) => ({
  features: state.default.features,
});

export default createFragmentContainer(
  connect<any, any, _, _, _, _>(mapStateToProps)(UserAvatarListContainer),
  {
    users: graphql`
      fragment UserAvatarList_users on User @relay(plural: true) {
        id
        username
        ...UserAvatarLegacy_user
      }
    `,
  },
);
