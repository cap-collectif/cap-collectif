// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import Avatar, { type Props as AvatarProps } from '~ds/Avatar/Avatar';
import { type NewUserAvatarLegacy_user } from '~relay/NewUserAvatarLegacy_user.graphql';

type Props = {|
  ...AvatarProps,
  user: NewUserAvatarLegacy_user,
|};

export const NewUserAvatarLegacy = ({ user, alt, ...props }: Props) => (
  <Avatar name={user.username} src={user.media?.url} alt={alt ?? user.username} {...props} />
);

export default createFragmentContainer(NewUserAvatarLegacy, {
  user: graphql`
    fragment NewUserAvatarLegacy_user on User {
      username
      media {
        url
      }
    }
  `,
});
