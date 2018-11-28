// @flow
import * as React from 'react';

type Props = { user: ?Object, className: string };
type State = void;

export default class UserLink extends React.Component<Props, State> {
  static defaultProps = {
    className: '',
  };

  render() {
    const { user, className } = this.props; // eslint-disable-line react/prop-types
    let userUrl = user && user._links && user._links.profile ? user._links.profile : null;
    if (!userUrl) {
      userUrl = user && user.show_url ? user.show_url : null;
    }
    if (!userUrl) {
      userUrl = user && user.url ? user.url : null;
    }
    const username = user && user.displayName ? user.displayName : 'Utilisateur supprimé';
    if (userUrl) {
      return (
        <a className={className} href={userUrl}>
          <span>{username}</span>
        </a>
      );
    }
    return <span className={className}>{username}</span>;
  }
}
