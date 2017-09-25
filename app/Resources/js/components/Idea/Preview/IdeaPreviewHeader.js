import React from 'react';
import moment from 'moment';
import { FormattedDate } from 'react-intl';
import UserAvatar from '../../User/UserAvatar';
import UserLink from '../../User/UserLink';

const IdeaPreviewHeader = React.createClass({
  propTypes: {
    idea: React.PropTypes.object.isRequired,
  },

  render() {
    const { idea } = this.props;
    return (
      <div className="idea__preview__header">
        <UserAvatar user={idea.author} className="pull-left idea__avatar" />
        <div className="idea__author">
          <UserLink user={idea.author} className="small" />
          <p className="excerpt small idea__date">
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
      </div>
    );
  },
});

export default IdeaPreviewHeader;
