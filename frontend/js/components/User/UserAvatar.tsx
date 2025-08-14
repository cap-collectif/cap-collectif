import React, { FC } from 'react'
import styled, { css } from 'styled-components'
import { connect } from 'react-redux'
import { graphql, useFragment } from 'react-relay'
import { Avatar, AvatarProps } from '@cap-collectif/ui'
import type { State } from '~/types'
import type { UserAvatar_user$data, UserAvatar_user$key } from '~relay/UserAvatar_user.graphql'
import { Circle } from '~ui/Medias/AvatarBadge/AvatarBadge.style'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import Icon from '@shared/ui/LegacyIcons/Icon'

export type Badge = {
  color: string
  icon: string
  size: number
  iconSize: number
  iconColor: string
}
type Props = Omit<AvatarProps, 'name'> & {
  user: UserAvatar_user$key | null | undefined
  size?: AvatarProps['size']
  className?: string
  defaultAvatar?: string | null | undefined
  displayUrl?: boolean
  style?: any
  onBlur?: () => void
  onFocus?: () => void
  onMouseOver?: () => void
  onMouseOut?: () => void
  onClick?: () => void
  badge?: Badge
  needDefaultAvatar?: boolean
  role?: string
}

const commonStyleAvatar = () => css`
  position: relative;

  .circle {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: -0;
    right: -5px;
  }
`

const UserAvatarLink = styled.a<{
  hasBadge: boolean
}>`
  text-decoration: none !important;
  vertical-align: text-bottom;
  display: inline-block;
  ${() => commonStyleAvatar()}
`
const UserAvatarContainer = styled.span<{
  hasBadge: boolean
}>`
  ${() => commonStyleAvatar()}
`

const FRAGMENT = graphql`
  fragment UserAvatar_user on Contributor {
    ...on User {
        url
    }
    username
    avatarUrl
  }
`

const mapStateToProps = (state: State) => ({
  defaultAvatar: state.default.images && state.default.images.avatar,
})

export const UserAvatarRender = connect(mapStateToProps)(
  ({
    user,
    defaultAvatar,
    size = 'lg',
    className,
    needDefaultAvatar,
    role,
    displayUrl = true,
    onBlur,
    onFocus,
    onMouseOver,
    onMouseOut,
    badge,
    style,
    ...props
  }: Omit<Props, 'user'> & { user: UserAvatar_user$data | null }) => {
    const profiles = useFeatureFlag('profiles')

    const renderAvatar = () => (
      <Avatar
        name={user?.username || ''}
        alt={user?.username}
        src={user?.avatarUrl || defaultAvatar}
        mr={2}
        size={size}
        {...props}
      />
    )

    const renderBadge = (badge: Badge) => {
      return (
        <Circle color={badge.color} size={badge.size}>
          <Icon
            name={badge.icon}
            size={badge.iconSize}
            color={badge.iconColor}
          />
        </Circle>
      )
    }

    const funcProps = {
      onBlur,
      onFocus,
      onMouseOver,
      onMouseOut,
    }

    if (user && user.url && profiles) {
      return (
        <UserAvatarLink
          {...funcProps}
          className={className}
          style={style}
          hasBadge={!!badge}
          href={displayUrl ? user.url : null}
          aria-describedby={props['aria-describedby']}
        >
          {renderAvatar()}
          {badge && renderBadge(badge)}
        </UserAvatarLink>
      )
    }

    return (
      <UserAvatarContainer {...funcProps} className={className} style={style} hasBadge={!!badge}>
        {renderAvatar()}
        {badge && renderBadge(badge)}
      </UserAvatarContainer>
    )
  },
)

export const UserAvatar: FC<Props> = ({ user: userKey, ...props }) => {
  const user = useFragment(FRAGMENT, userKey)
  return <UserAvatarRender user={user} {...props} />
}

export default connect(mapStateToProps)(UserAvatar)
