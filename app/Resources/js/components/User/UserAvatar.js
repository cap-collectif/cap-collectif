import React from 'react';
import DefaultAvatar from './DefaultAvatar';

const UserAvatar = React.createClass({
  displayName: 'UserAvatar',
  propTypes: {
    user: React.PropTypes.object,
    size: React.PropTypes.number,
    className: React.PropTypes.string,
    style: React.PropTypes.object,
    anchor: React.PropTypes.bool,
    onBlur: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    onMouseOver: React.PropTypes.func,
    onMouseOut: React.PropTypes.func,
  },

  getDefaultProps() {
    return {
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
  },

  renderAvatar() {
    const { user } = this.props;
    const size = `${this.props.size}px`;
    if (user && user.media) {
      return (
        <img
          src={user.media.url}
          alt={user.username}
          className="img-circle"
          style={{ width: size, height: size }}
        />
      );
    }
    return <DefaultAvatar size={this.props.size} />;
  },

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
  },
});

export default UserAvatar;
