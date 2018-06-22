// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import UserAvatar from './UserAvatar';
import UserLink from './UserLink';
import { CardContainer } from '../Ui/Card/CardContainer';
import { CardUser } from '../Ui/Card/CardUser';

type Props = {
  user: ?Object,
  username: ?string,
  className: string,
  style: ?Object,
};

export class UserPreview extends React.Component<Props> {
  static defaultProps = {
    user: null,
    username: null,
    className: '',
    style: {},
  };

  render() {
    const { className, style } = this.props;
    const user = this.props.user;
    const username =
      this.props.username === 'ANONYMOUS' ? (
        <FormattedMessage id="global.anonymous" />
      ) : (
        this.props.username
      );
    if (!user && !username) {
      return null;
    }
    const contributionsCount = user && user.contributionsCount ? user.contributionsCount : 0;
    const classes = {
      'pb-10': true,
      [className]: true,
    };

    return (
      <CardContainer className={classNames(classes)} style={style}>
        <CardUser>
          <div className="card__user__avatar">
            <UserAvatar user={user} />
          </div>
          <div className="ellipsis">
            {user ? <UserLink user={user} /> : <span>{username}</span>}
            <p className="excerpt small">
              {contributionsCount === false ? null : (
                <span>
                  <FormattedMessage
                    id="global.counters.contributions"
                    values={{ num: contributionsCount }}
                  />
                </span>
              )}
            </p>
          </div>
        </CardUser>
      </CardContainer>
    );
  }
}

export default UserPreview;
