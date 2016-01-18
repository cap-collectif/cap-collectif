import React from 'react';
import DefaultAvatar from './DefaultAvatar';

const UserAvatar = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
    size: React.PropTypes.number,
    className: React.PropTypes.string,
    style: React.PropTypes.object,
    anchor: React.PropTypes.bool,
  },

  getDefaultProps() {
    return {
      user: null,
      size: 45,
      className: '',
      style: {},
      anchor: true,
    };
  },

  renderAvatar() {
    const size = this.props.size + 'px';
    if (this.props.user && this.props.user.media) {
      return <img src={this.props.user.media.url} className="img-circle" style={{width: size, height: size}} />;
    }
    return <DefaultAvatar size={this.props.size} />;
  },

  render() {
    if (this.props.user && this.props.user._links && this.props.anchor) {
      return (
        <a className={this.props.className} style={this.props.style} href={this.props.user._links.profile}>
          { this.renderAvatar() }
        </a>
      );
    }

    return (
      <span className={this.props.className} style={this.props.style} >
        { this.renderAvatar() }
      </span>
    );
  },

});

export default UserAvatar;
