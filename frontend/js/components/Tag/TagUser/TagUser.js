// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import Tag from '~/components/Ui/Labels/Tag';
import UserAvatar from '~/components/User/UserAvatar';
import UserLink from '~/components/User/UserLink';
import type { TagUser_user } from '~relay/TagUser_user.graphql';

type TagUserProps = {
  user: TagUser_user,
  size: number,
};

export const TagUser = ({ user, size }: TagUserProps) => (
  <Tag CustomImage={<UserAvatar user={user} size={size} />} className="tagUser">
    <UserLink user={user} />
  </Tag>
);

export default createFragmentContainer(TagUser, {
  user: graphql`
    fragment TagUser_user on User {
      ...UserAvatar_user
      ...UserLink_user
    }
  `,
});
