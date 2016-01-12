import React from 'react';

export default class UserLink extends React.Component {

  render() {
    return <a href={this.props.user._links.profile}>{this.props.user.displayName}</a>;
  }
}

UserLink.propTypes = {
  user: React.PropTypes.object.isRequired,
};
