// @flow
import React, { PropTypes, Component } from 'react';

export default class UserLink extends Component {
  render() {
    const { user, className } = this.props;
    let userUrl = user && user._links && user._links.profile
      ? user._links.profile
      : null;
    if (!userUrl) {
      userUrl = user && user.url ? user.url : null;
    }
    const username = user && user.displayName
      ? user.displayName
      : 'Utilisateur supprimé';
    if (userUrl) {
      return (
        <a className={className} href={userUrl}>
          <strong style={{ color: '#14171a' }}>{username}</strong>
        </a>
      );
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
