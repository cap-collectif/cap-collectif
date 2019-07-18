// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

import UserAvatarList from '../Ui/List/UserAvatarList';
import UserAvatar from './UserAvatar';
import type { State, FeatureToggles } from '../../types';
import type { UserAvatarList_users } from '~relay/UserAvatarList_users.graphql';

type Props = {|
  users: UserAvatarList_users,
  max: number,
  onClick?: () => void,
  features: FeatureToggles,
|};

export const UserAvatarListContainer = (props: Props) => {
  const { users, max, onClick, features } = props;

  const shouldRedirectProfile = users.length === 1 && features.profiles;

  return (
    <button type="button" onClick={onClick}>
      <UserAvatarList max={max}>
        {users &&
          users.slice(0, max).map((user, index) =>
            shouldRedirectProfile ? (
              <UserAvatar user={user} features={features} />
            ) : (        
              <OverlayTrigger 
                key={index}
                placement="top"
                overlay={<Tooltip id={`tooltip-${user.id}`}>{user.username}</Tooltip>}>
                {/* $FlowFixMe */}
                <UserAvatar user={user} features={features} displayUrl={false} />
              </OverlayTrigger>
            ),
          )}
      </UserAvatarList>
    </button>
  );
};

UserAvatarListContainer.defaultProps = {
  max: 5,
};

const mapStateToProps = (state: State) => ({
  features: state.default.features,
});

export default createFragmentContainer(connect(mapStateToProps)(UserAvatarListContainer), {
  users: graphql`
    fragment UserAvatarList_users on User @relay(plural: true) {
      id
      username
      ...UserAvatar_user
    }
  `,
});
