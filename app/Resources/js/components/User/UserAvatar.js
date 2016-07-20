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
    const size = this.props.size + 'px';
    if (this.props.user && this.props.user.media) {
      return <img src={this.props.user.media.url} className="img-circle" style={{ width: size, height: size }} />;
    }
    return <DefaultAvatar size={this.props.size} />;
  },

  render() {
    const funcProps = {
      onBlur: this.props.onBlur,
      onFocus: this.props.onFocus,
      onMouseOver: this.props.onMouseOver,
      onMouseOut: this.props.onMouseOut,
    };
    if (this.props.user && this.props.user._links && this.props.user._links.profile && this.props.anchor) {
      return (
        <a {...funcProps} className={this.props.className} style={this.props.style} href={this.props.user._links.profile}>
          { this.renderAvatar() }
        </a>
      );
    }

    return (
      <span {...funcProps} className={this.props.className} style={this.props.style} >
        { this.renderAvatar() }
      </span>
    );
  },

});

export default UserAvatar;
