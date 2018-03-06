import React from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import UserAvatar from './UserAvatar';
import UserLink from './UserLink';

const UserPreview = React.createClass({
  displayName: 'UserPreview',

  propTypes: {
    user: React.PropTypes.object,
    username: React.PropTypes.string,
    className: React.PropTypes.string,
    style: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      user: null,
      username: null,
      className: '',
      style: {}
    };
  },

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
      media: true,
      'media--user-thumbnail': true,
      'media--macro__user': true,
      box: true,
      [className]: true
    };

    return (
      <div className={classNames(classes)} style={style}>
        <UserAvatar user={user} className="pull-left" />
        <div className="media-body">
          <p className="media--macro__user  small">
            {user ? <UserLink user={user} /> : <span>{username}</span>}
          </p>
          <span className="excerpt">
            {contributionsCount === false ? null : (
              <div>
                <FormattedMessage
                  id="global.counters.contributions"
                  values={{ num: contributionsCount }}
                />
              </div>
            )}
          </span>
        </div>
      </div>
    );
  }
});

export default UserPreview;
