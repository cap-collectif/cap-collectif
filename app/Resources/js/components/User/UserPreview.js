// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import classNames from 'classnames';
import UserAvatar from './UserAvatar';
import UserLink from './UserLink';
import { CardContainer } from '../Ui/Card/CardContainer';
import { CardUser } from '../Ui/Card/CardUser';
import type { UserPreview_user } from './__generated__/UserPreview_user.graphql';
import UserNotConfirmedLabel from './UserNotConfirmedLabel';

type Props = {
  user: ?UserPreview_user,
};

export class UserPreview extends React.Component<Props> {
  render() {
    const user = this.props.user;
    const contributionsCount = user && user.contributionsCount ? user.contributionsCount : 0;
    const classes = {
      'pb-10': true,
    };

    return (
      <CardContainer className={classNames(classes)}>
        <CardUser>
          <div className="card__user__avatar">
            <UserAvatar user={user} />
          </div>
          <div className="ellipsis">
            {user ? <UserLink user={user} /> : <FormattedMessage id="global.anonymous" />}
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
          </div>
        </CardUser>
      </CardContainer>
    );
  }
}

export default createFragmentContainer(UserPreview, {
  user: graphql`
    fragment UserPreview_user on User {
      ...UserNotConfirmedLabel_user
      show_url
      displayName
      username
      contributionsCount
      media {
        url
      }
    }
  `,
});
