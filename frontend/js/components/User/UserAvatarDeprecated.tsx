import React from 'react'
import { connect } from 'react-redux'
import type { State } from '../../types'
import DefaultAvatar from './DefaultAvatar'
import Image from '~ui/Primitives/Image'
type Props = {
  user:
    | {
        readonly username: string
        readonly media:
          | {
              readonly url: string
            }
          | null
          | undefined
        readonly _links: {
          readonly profile?: string
        }
      }
    | null
    | undefined
  size?: number
  className?: string
  defaultAvatar?: string | null | undefined
  style?: any
  anchor?: boolean
  onBlur?: (...args: Array<any>) => any
  onFocus?: (...args: Array<any>) => any
  onMouseOver?: (...args: Array<any>) => any
  onMouseOut?: (...args: Array<any>) => any
}
export class UserAvatarDeprecated extends React.Component<Props> {
  static defaultProps = {
    user: null,
    size: 45,
    className: '',
    style: {},
    anchor: true,
    onBlur: () => {},
    onFocus: () => {},
    onMouseOver: () => {},
    onMouseOut: () => {},
  }

  renderAvatar() {
    const { user, defaultAvatar, size } = this.props
    const mediaSize = size && `${size}px`

    if (user && user.media) {
      return (
        <Image
          src={user.media.url}
          alt=""
          className="img-circle object-cover mr-10"
          style={{
            minWidth: mediaSize,
            width: mediaSize,
            height: mediaSize,
          }}
        />
      )
    }

    if (user && defaultAvatar) {
      return (
        <Image
          src={defaultAvatar}
          alt=""
          className="img-circle object-cover mr-10"
          style={{
            minWidth: mediaSize,
            width: mediaSize,
            height: mediaSize,
          }}
        />
      )
    }

    return <DefaultAvatar className="img-circle avatar user-avatar mr-10" size={size} />
  }

  render() {
    const { anchor, className, onBlur, onFocus, onMouseOut, onMouseOver, style, user } = this.props
    const funcProps = {
      onBlur,
      onFocus,
      onMouseOver,
      onMouseOut,
    }

    if (user && user._links && user._links.profile && anchor) {
      return (
        <a {...funcProps} className={className} style={style} href={user._links.profile}>
          {this.renderAvatar()}
        </a>
      )
    }

    return (
      <span {...funcProps} className={className} style={style}>
        {this.renderAvatar()}
      </span>
    )
  }
}

const mapStateToProps = (state: State) => ({
  defaultAvatar: state.default.images && state.default.images.avatar,
})

export default connect<any, any>(mapStateToProps)(UserAvatarDeprecated)
