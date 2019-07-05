// @flow
import React from 'react';
import { connect } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';

import DefaultAvatar from './DefaultAvatar';
import type { State, FeatureToggles } from '../../types';

type Props = {|
  user: ?{
    +username: string,
    +media: ?{
      +url: string,
    },
    +url?: string,
  },
  features: FeatureToggles,
  size?: number,
  className?: string,
  defaultAvatar?: ?string,
  style?: any,
  onBlur?: () => void,
  onFocus?: () => void,
  onMouseOver?: () => void,
  onMouseOut?: () => void,
|};

export class UserAvatar extends React.Component<Props> {
  static defaultProps = {
    user: null,
    size: 45,
    className: '',
    style: {},
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
          alt={user.username}
          className="img-circle object-cover user-avatar mr-10"
          style={{ width: mediaSize, height: mediaSize }}
        />
      );
    }

    if (user && defaultAvatar) {
      return (
        <img
          src={defaultAvatar}
          alt={user.username}
          className="img-circle object-cover user-avatar mr-10"
          style={{ width: mediaSize, height: mediaSize }}
        />
      );
    }

    return <DefaultAvatar className="img-circle avatar user-avatar mr-10" size={size} />;
  }

  render() {
    const {
      className,
      onBlur,
      onFocus,
      onMouseOut,
      onMouseOver,
      style,
      user,
      features,
    } = this.props;

    const funcProps = {
      onBlur,
      onFocus,
      onMouseOver,
      onMouseOut,
    };

    if (user && user.url && features.profiles) {
      return (
        <a {...funcProps} className={className} style={style} href={user.url}>
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

export default createFragmentContainer(connect(mapStateToProps)(UserAvatar), {
  user: graphql`
    fragment UserAvatar_user on User {
      id
      url
      username
      media {
        url
      }
    }
  `,
});
