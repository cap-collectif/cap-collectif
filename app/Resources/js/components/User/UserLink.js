import React, { PropTypes, Component } from 'react';

export default class UserLink extends Component {

  render() {
    const {
      user,
      className,
    } = this.props;
    const url = user && user._links && user._links.profile ? user._links.profile : null;
    const username = user && user.displayName ? user.displayName : 'Utilisateur supprimé';
    if (url) {
      return <a className={className} href={url}>{username}</a>;
    }
    return <span className={className}>{username}</span>;
  }
}

UserLink.propTypes = {
  user: PropTypes.object.isRequired,
  className: PropTypes.string,
};

UserLink.defaultProps = {
  className: '',
};
