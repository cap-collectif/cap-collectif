import React from 'react';
import moment from 'moment';
import { FormattedDate } from 'react-intl';
import UserAvatar from '../../User/UserAvatar';
import UserLink from '../../User/UserLink';
import { CardUser } from '../../Ui/Card/CardUser';

const IdeaPreviewHeader = React.createClass({
  propTypes: {
    idea: React.PropTypes.object.isRequired,
  },

  render() {
    const { idea } = this.props;
    return (
      <CardUser>
        <div className="card__user__avatar">
          <UserAvatar user={idea.author} className="pull-left idea__avatar" />
        </div>
        <div className="ellipsis">
          <UserLink user={idea.author} className="small" />
          <p className="excerpt small">
            <FormattedDate
              value={moment(idea.createdAt)}
              day="numeric"
              month="long"
              year="numeric"
              hour="numeric"
              minute="numeric"
            />
          </p>
        </div>
        <hr />
      </CardUser>
    );
  },
});

export default IdeaPreviewHeader;
