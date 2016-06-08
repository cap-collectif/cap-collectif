import React, { PropTypes, Component } from 'react';

export default class UserLink extends Component {

  render() {
    const { user } = this.props;
    const url = user && user._links && user._links.profile ? user._links.profile : null;
    const username = user && user.displayName ? user.displayName : 'Utilisateur supprimé';
    if (url) {
      return <a href={url}>{username}</a>;
    }
    return <span>{username}</span>;
  }
}

UserLink.propTypes = {
  user: PropTypes.object.isRequired,
};
