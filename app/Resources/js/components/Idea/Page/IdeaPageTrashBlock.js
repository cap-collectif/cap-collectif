import React from 'react';
import { FormattedMessage, FormattedDate } from 'react-intl';
import moment from 'moment';

const IdeaPageTrashBlock = React.createClass({
  propTypes: {
    idea: React.PropTypes.object.isRequired
  },

  render() {
    const { idea } = this.props;

    if (!idea.trashed) {
      return null;
    }

    return (
      <div id="idea__trash-block">
        <h2>{<FormattedMessage id="idea.trashed.reason" />}</h2>
        {idea.trashedReason ? (
          <p>{idea.trashedReason}</p>
        ) : (
          <p>{<FormattedMessage id="idea.trashed.no_reason" />}</p>
        )}
        <p className="excerpt">
          <FormattedMessage
            id="idea.trashed.date"
            values={{
              date: (
                <FormattedDate
                  value={moment(idea.trashedAt)}
                  day="numeric"
                  month="long"
                  year="numeric"
                  hour="numeric"
                  minute="numeric"
                />
              )
            }}
          />
        </p>
      </div>
    );
  }
});

export default IdeaPageTrashBlock;
