import React from 'react';
import { FormattedMessage } from 'react-intl';

const IdeaPreviewBody = React.createClass({
  propTypes: {
    idea: React.PropTypes.object.isRequired,
  },

  render() {
    const { idea } = this.props;
    return (
      <div className="card__body">
        <div className="card__body__infos">
          <h3 className="card__title">
            <a href={idea._links.show}>{idea.title}</a>
          </h3>
          {idea.trashed ? (
            <span className="label label-default">
            {<FormattedMessage id="idea.preview.trashed" />}
          </span>
          ) : null}
        </div>
        <span className="excerpt small">
          <FormattedMessage
            id="idea.preview.counters.votes"
            values={{
              num: idea.votesCount,
            }}
          />
          {idea.commentable ? (
            <span>
              {' • '}
              <FormattedMessage
                id="idea.preview.counters.comments"
                values={{
                  num: idea.commentsCount,
                }}
              />
            </span>
          ) : null}
        </span>
      </div>
    );
  },
});

export default IdeaPreviewBody;
