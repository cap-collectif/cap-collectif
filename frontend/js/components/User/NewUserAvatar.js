// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import ColorHash from 'color-hash';
import { Avatar } from '@cap-collectif/ui';
import { type Props as AvatarProps } from '~ds/Avatar/Avatar';
import { type NewUserAvatar_user } from '~relay/NewUserAvatar_user.graphql';
import { colorContrast } from '~/utils/colorContrast';

type Props = {|
  ...AvatarProps,
  user: NewUserAvatar_user,
|};

const hash = new ColorHash();

export const NewUserAvatar = ({ user, alt, ...props }: Props) => {
  const backgroundColor = hash.hex(user.username);
  const computedColor = colorContrast(backgroundColor);
  return (
    <Avatar
      name={user.username}
      src={user.media?.url}
      alt={alt ?? user.username}
      color={computedColor}
      backgroundColor={backgroundColor}
      {...props}
    />
  );
};

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
