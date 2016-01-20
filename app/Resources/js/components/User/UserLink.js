import React, {PropTypes, Component} from 'react';

export default class UserLink extends Component {

  render() {
    const {user} = this.props;
    const url = user._links && user._links.profile ? user._links.profile : '#';
    return <a href={url}>{user.displayName}</a>;
  }
}

UserLink.propTypes = {
  user: PropTypes.object.isRequired,
};
