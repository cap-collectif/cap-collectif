// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect } from 'react-redux';
import type { UserLink_user } from '~relay/UserLink_user.graphql';
import type { State } from '../../types';

type ReduxProps = {|
  +toggled: boolean,
|};
type Props = {|
  +className: string,
  +user?: ?UserLink_user,
  +legacyUser?: Object,
  ...ReduxProps,
|};

export class UserLink extends React.Component<Props, State> {
  static defaultProps = {
    className: '',
  };

  render() {
    const { legacyUser, className, toggled, user } = this.props;

    if (legacyUser) {
      let userUrl =
        legacyUser && legacyUser._links && legacyUser._links.profile && toggled
          ? legacyUser._links.profile
          : null;
      const username =
        legacyUser && legacyUser.displayName ? legacyUser.displayName : 'Utilisateur supprimé';

      if (!userUrl) {
        userUrl = user && user.url ? user.url : null;
      } else {
        return (
          <a className={className} href={userUrl}>
            <span>{username}</span>
          </a>
        );
      }
      return <span className={className}>{username}</span>;
    }
    if (user) {
      if (toggled) {
        return (
          <a className={className} href={user.url}>
            {user.displayName}
          </a>
        );
      }
      return <span>{user.displayName}</span>;
    }

    return null;
  }
}

const mapStateToProps = (state: State) => ({
  toggled: !!state.default.features.profiles,
});

export const container = connect(mapStateToProps)(UserLink);

export default createFragmentContainer(container, {
  user: graphql`
    fragment UserLink_user on User {
      displayName
      url
    }
  `,
});
