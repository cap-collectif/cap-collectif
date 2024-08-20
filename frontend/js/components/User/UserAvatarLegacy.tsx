import React from 'react'
import styled, { css } from 'styled-components'
import { connect } from 'react-redux'
import { graphql, createFragmentContainer } from 'react-relay'
import Icon from '@shared/ui/LegacyIcons/Icon'
import DefaultAvatar from './DefaultAvatar'
import type { State, FeatureToggles } from '~/types'
import type { UserAvatarLegacy_user } from '~relay/UserAvatarLegacy_user.graphql'
import { Circle } from '~ui/Medias/AvatarBadge/AvatarBadge.style'
import Image from '~ui/Primitives/Image'

export type Badge = {
  color: string
  icon: string
  size: number
  iconSize: number
  iconColor: string
}
type Props = {
  user: UserAvatarLegacy_user | null | undefined
  features?: FeatureToggles
  size?: number
  className?: string
  defaultAvatar?: string | null | undefined
  displayUrl?: boolean
  style?: any
  onBlur?: () => void
  onFocus?: () => void
  onMouseOver?: () => void
  onMouseOut?: () => void
  badge?: Badge
  needDefaultAvatar?: boolean
  role?: string
}

const commonStyleAvatar = hasBadge => css`
  position: relative;
  margin-right: ${hasBadge ? '5px' : 'initial'};

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
  vertical-align: text-bottom;
  display: inline-block;
  ${props => commonStyleAvatar(props.hasBadge)}
`
const UserAvatarContainer = styled.span<{
  hasBadge: boolean
}>`
  ${props => commonStyleAvatar(props.hasBadge)}
`
export class UserAvatarLegacy extends React.Component<Props> {
  static defaultProps = {
    user: null,
    size: 45,
    style: {},
    className: '',
    displayUrl: true,
    onBlur: () => {},
    onFocus: () => {},
    onMouseOver: () => {},
    onMouseOut: () => {},
  }

  renderAvatar() {
    const { user, defaultAvatar, size, className, needDefaultAvatar, role } = this.props
    const mediaSize = size && `${size}px`

    if (user && user.media && !needDefaultAvatar) {
      return (
        <Image
          src={user.media.url}
          alt={user.username}
          className={`img-circle object-cover user-avatar mr-10 ${className || ''}`}
          role={role}
          aria-label={this.props['aria-label']}
          style={{
            width: mediaSize,
            height: mediaSize,
            minWidth: mediaSize,
          }}
        />
      )
    }

    if (user && defaultAvatar) {
      return (
        <Image
          src={defaultAvatar}
          alt={user.username}
          className={`img-circle object-cover user-avatar mr-10 ${className || ''}`}
          role={role}
          aria-label={this.props['aria-label']}
          style={{
            width: mediaSize,
            height: mediaSize,
            minWidth: mediaSize,
          }}
        />
      )
    }

    return (
      <DefaultAvatar
        className={`img-circle avatar user-avatar mr-10 ${className || ''}`}
        size={size}
        role={role}
        aria-label={this.props['aria-label']}
      />
    )
  }

  renderBadge(badge: Badge) {
    return (
      <Circle color={badge.color} size={badge.size}>
        <Icon name={badge.icon} size={badge.iconSize} color={badge.iconColor} />
      </Circle>
    )
  }

  render() {
    const { className, onBlur, onFocus, onMouseOut, onMouseOver, style, user, features, displayUrl, badge } = this.props
    const funcProps = {
      onBlur,
      onFocus,
      onMouseOver,
      onMouseOut,
    }

    if (user && user.url && features && features.profiles) {
      return (
        <UserAvatarLink
          {...funcProps}
          className={className}
          style={style}
          hasBadge={!!badge}
          href={displayUrl ? user.url : null}
          aria-describedby={this.props['aria-describedby']}
        >
          {this.renderAvatar()}
          {badge && this.renderBadge(badge)}
        </UserAvatarLink>
      )
    }

    return (
      <UserAvatarContainer {...funcProps} className={className} style={style} hasBadge={!!badge}>
        {this.renderAvatar()}
        {badge && this.renderBadge(badge)}
      </UserAvatarContainer>
    )
  }
}

const mapStateToProps = (state: State) => ({
  defaultAvatar: state.default.images && state.default.images.avatar,
  features: state.default.features,
})

export default createFragmentContainer(connect(mapStateToProps)(UserAvatarLegacy), {
  user: graphql`
    fragment UserAvatarLegacy_user on User {
      url
      username
      media {
        url
      }
    }
  `,
})
