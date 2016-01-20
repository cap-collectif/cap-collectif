import React, {PropTypes, Component} from 'react';

export default class UserLink extends Component {

  render() {
    const {user} = this.props;
    const url = user && user._links && user._links.profile ? user._links.profile : '#';
    const username = user && user.displayName ? user.displayName : 'Utilisateur supprimé';
    return <a href={url}>{username}</a>;
  }
}

UserLink.propTypes = {
  user: PropTypes.object.isRequired,
};
