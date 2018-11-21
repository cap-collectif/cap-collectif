// @flow
import React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import styled from 'styled-components';
import type { State } from '../../../types';
import DefaultAvatar from '../../User/DefaultAvatar';

type User = {
  +username: string,
  +media: ?{
    +url: string,
  },
  +_links: {
    +profile?: string,
  },
};

type Props = {
  user: ?User | ?Array<User>,
  size?: number,
  className?: string,
  defaultAvatar: ?string,
  anchor?: boolean,
};

export const Image = styled.img`
  object-fit: cover;
  border-radius: 50%;
  height: ${props => props.size}px;
  width: ${props => props.size}px;
`;

export class Avatar extends React.Component<Props> {
  static defaultProps = {
    user: null,
    size: 45,
    className: '',
    anchor: true,
  };

  renderAvatarImage(user: ?User) {
    const { defaultAvatar, size } = this.props;

    if (user && user.media && user.media.url) {
      return <Image size={size} src={user.media.url} alt={user.username} />;
    }

    if (user && defaultAvatar && defaultAvatar !== null) {
      return <Image size={size} src={defaultAvatar} alt={user.username} />;
    }

    return <DefaultAvatar size={size} />;
  }

  renderAvatarContainer(user: ?User, key?: number) {
    const { anchor, className } = this.props;

    if (user && user._links && user._links.profile && anchor) {
      return (
        <a href={user._links.profile} className={className} key={key}>
          {this.renderAvatarImage(user)}
        </a>
      );
    }

    return (
      <span className={className} key={key}>
        {this.renderAvatarImage(user)}
      </span>
    );
  }

  render() {
    const { user } = this.props;

    if (Array.isArray(user)) {
      return user.map((person, key) => this.renderAvatarContainer(person, key));
    }

    return this.renderAvatarContainer(user);
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  defaultAvatar: state.default.images && state.default.images.avatar,
});

export default connect(mapStateToProps)(Avatar);
