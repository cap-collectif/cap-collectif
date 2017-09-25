import React from 'react';
import { FormattedMessage } from 'react-intl';

const IdeaPreviewFooter = React.createClass({
  propTypes: {
    idea: React.PropTypes.object.isRequired,
  },

  render() {
    const { idea } = this.props;
    return (
      <div className="idea__preview__footer">
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

export default IdeaPreviewFooter;
