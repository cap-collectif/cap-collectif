// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import Avatar, { type Props as AvatarProps } from '~ds/Avatar/Avatar';
import { type NewUserAvatar_user } from '~relay/NewUserAvatar_user.graphql';

type Props = {|
  ...AvatarProps,
  user: NewUserAvatar_user,
|};

export const NewUserAvatar = ({ user, alt, ...props }: Props) => (
  <Avatar name={user.username} src={user.media?.url} alt={alt ?? user.username} {...props} />
);

export default createFragmentContainer(NewUserAvatar, {
  user: graphql`
    fragment NewUserAvatar_user on User {
      username
      media {
        url
      }
    }
  `,
});
