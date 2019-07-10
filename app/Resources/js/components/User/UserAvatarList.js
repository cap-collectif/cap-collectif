// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { graphql, createFragmentContainer } from 'react-relay';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

import UserAvatar from './UserAvatar';
import colors from '../../utils/colors';
import type { State, FeatureToggles } from '../../types';
import type { UserAvatarList_users } from '~relay/UserAvatarList_users.graphql';

type Props = {|
  users: UserAvatarList_users,
  max: number,
  onClick?: () => void,
  features: FeatureToggles,
|};

const AvatarButton = styled.button.attrs({})`
  outline: none;
  border: none;
  background: none;
  padding: 0;
`;

const AvatarDefaultButton = styled(AvatarButton)`
  color: ${colors.darkGray} !important;
  background-color: ${colors.borderColor} !important;
  height: 45px;
  width: 45px;
  border-radius: 50%;
`;

export const UserAvatarList = (props: Props) => {
  const { users, max, onClick, features } = props;

  const shouldRedirectProfile = users.length === 1 && features.profiles;

  return (
    <React.Fragment>
      {users &&
        users.slice(0, max).map((user, index) =>
          shouldRedirectProfile ? (
            <UserAvatar user={user} features={features} />
          ) : (
            <AvatarButton onClick={onClick}>
              <OverlayTrigger
                key={index}
                placement="top"
                overlay={<Tooltip id={`tooltip-${user.id}`}>{user.username}</Tooltip>}>
                {/* $FlowFixMe */}
                <UserAvatar user={user} features={features} displayUrl={false} />
              </OverlayTrigger>
            </AvatarButton>
          ),
        )}
      {users.length > max && (
        <AvatarButton onClick={onClick}>
          <AvatarDefaultButton
            bsStyle="link"
            id="show-all"
            onClick={() => {}}
            className="more__link text-center">
            {`+${users.length - max >= 100 ? '99' : users.length - max}`}
          </AvatarDefaultButton>
        </AvatarButton>
      )}
    </React.Fragment>
  );
};

UserAvatarList.defaultProps = {
  max: 5,
};

const mapStateToProps = (state: State) => ({
  features: state.default.features,
});

export default createFragmentContainer(connect(mapStateToProps)(UserAvatarList), {
  users: graphql`
    fragment UserAvatarList_users on User @relay(plural: true) {
      id
      username
      ...UserAvatar_user
    }
  `,
});
