// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import UserAvatar from './UserAvatar';
import UserLink from './UserLink';
import type { UserPreview_user } from './__generated__/UserPreview_user.graphql';
import UserNotConfirmedLabel from './UserNotConfirmedLabel';
import Media from '../Ui/Medias/Media/Media';
import Card from '../Ui/Card/Card';

type Props = {
  user: ?UserPreview_user,
};

export class UserPreview extends React.Component<Props> {
  render() {
    const { user } = this.props;
    const contributionsCount = user && user.contributionsCount ? user.contributionsCount : 0;

    return (
      <Card>
        <Card.Body>
          <Media>
            <Media.Left>
              {/* $FlowFixMe */}
              <UserAvatar user={user} />
            </Media.Left>
            <Media.Body>
              {user ? (
                <UserLink className="excerpt" user={user} />
              ) : (
                <span className="excerpt">
                  <FormattedMessage id="global.anonymous" />
                </span>
              )}
              <p className="excerpt small">
                {user ? (
                  <span>
                    <FormattedMessage
                      id="global.counters.contributions"
                      values={{ num: contributionsCount }}
                    />
                  </span>
                ) : null}
              </p>
              {/* $FlowFixMe */}
              {user ? <UserNotConfirmedLabel user={user} /> : null}
            </Media.Body>
          </Media>
        </Card.Body>
      </Card>
    );
  }
}

export default createFragmentContainer(UserPreview, {
  user: graphql`
    fragment UserPreview_user on User {
      ...UserNotConfirmedLabel_user
      url
      displayName
      username
      contributionsCount
      media {
        url
      }
    }
  `,
});
