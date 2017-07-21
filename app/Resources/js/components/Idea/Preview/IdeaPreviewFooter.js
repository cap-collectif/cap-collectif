import React from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';

const IdeaPreviewFooter = React.createClass({
  propTypes: {
    idea: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { idea } = this.props;
    return (
      <div className="idea__preview__footer">
        <span className="excerpt small">
          <FormattedMessage
            num={idea.votesCount}
            message={this.getIntlMessage('idea.preview.counters.votes')}
          />
          {
            idea.commentable
            ? <span>
              { ' • ' }
              <FormattedMessage
                num={idea.commentsCount}
                message={this.getIntlMessage('idea.preview.counters.comments')}
              />
              </span>
            : null
          }
        </span>
      </div>
    );
  },

});

export default IdeaPreviewFooter;
