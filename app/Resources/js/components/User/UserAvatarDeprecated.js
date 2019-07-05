// @flow
import React from 'react';
import { connect } from 'react-redux';
import DefaultAvatar from './DefaultAvatar';
import type { State } from '../../types';

type Props = {
  user: ?{
    +username: string,
    +media: ?{
      +url: string,
    },
    +_links: {
      +profile?: string,
    },
  },
  size?: number,
  className?: string,
  defaultAvatar?: ?string,
  style?: any,
  anchor?: boolean,
  onBlur?: Function,
  onFocus?: Function,
  onMouseOver?: Function,
  onMouseOut?: Function,
};

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
  };

  renderAvatar() {
    const { user, defaultAvatar, size } = this.props;
    const mediaSize = size && `${size}px`;

    if (user && user.media) {
      return (
        <img
          src={user.media.url}
          alt=""
          className="img-circle object-cover mr-10"
          style={{ width: mediaSize, height: mediaSize }}
        />
      );
    }

    if (user && defaultAvatar) {
      return (
        <img
          src={defaultAvatar}
          alt=""
          className="img-circle object-cover mr-10"
          style={{ width: mediaSize, height: mediaSize }}
        />
      );
    }

    return <DefaultAvatar className="img-circle avatar user-avatar mr-10" size={size} />;
  }

  render() {
    const { anchor, className, onBlur, onFocus, onMouseOut, onMouseOver, style, user } = this.props;
    const funcProps = {
      onBlur,
      onFocus,
      onMouseOver,
      onMouseOut,
    };

    if (user && user._links && user._links.profile && anchor) {
      return (
        <a {...funcProps} className={className} style={style} href={user._links.profile}>
          {this.renderAvatar()}
        </a>
      );
    }

    return (
      <span {...funcProps} className={className} style={style}>
        {this.renderAvatar()}
      </span>
    );
  }
}

const mapStateToProps = (state: State) => ({
  defaultAvatar: state.default.images && state.default.images.avatar,
});

export default connect(mapStateToProps)(UserAvatarDeprecated);
