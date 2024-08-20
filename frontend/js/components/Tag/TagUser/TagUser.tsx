import * as React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import Tag from '~/components/Ui/Labels/Tag'
import UserAvatarLegacy from '~/components/User/UserAvatarLegacy'
import UserLink from '~/components/User/UserLink'
import type { TagUser_user } from '~relay/TagUser_user.graphql'
import colors from '~/utils/colors'
import IconRounded from '@shared/ui/LegacyIcons/IconRounded'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'

type TagUserProps = {
  user: TagUser_user
  size: number
}
export const TagUser = ({ user, size }: TagUserProps) => {
  const Avatar =
    user.media && user.media.url ? (
      <UserAvatarLegacy user={user} size={size} />
    ) : (
      <IconRounded size={18} color={colors.darkGray}>
        <Icon name={ICON_NAME.user} color="#fff" size={10} />
      </IconRounded>
    )
  return (
    <Tag CustomImage={Avatar} className="tagUser">
      <UserLink user={user} />
    </Tag>
  )
}
export default createFragmentContainer(TagUser, {
  user: graphql`
    fragment TagUser_user on User {
      media {
        url
      }
      ...UserAvatarLegacy_user
      ...UserLink_user
    }
  `,
})
